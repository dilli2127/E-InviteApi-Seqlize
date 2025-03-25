import { compareFaces } from "../../service/rekognitionService.js";
import { s3 } from "../config/aws.js";
import MatchRequest from "../models/MatchRequest.js";

export const uploadSelfie = async (req, res) => {
    const { userPhone } = req.body;
    const selfieFile = req.file;

    if (!selfieFile) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const eventPhotos = await s3.listObjectsV2({
            Bucket: process.env.S3_BUCKET_NAME,
            Prefix: "event-photos/",
        }).promise();

        for (const photo of eventPhotos.Contents) {
            const isMatch = await compareFaces(selfieFile.key, photo.Key);
            if (isMatch) {
                const match = await MatchRequest.create({
                    userPhone,
                    selfieKey: selfieFile.key,
                    status: "matched",
                    matchedPhotoKey: photo.Key
                });

                return res.status(200).json({
                    message: "Match found!",
                    matchedPhotoUrl: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${photo.Key}`
                });
            }
        }

        await MatchRequest.create({
            userPhone,
            selfieKey: selfieFile.key,
            status: "pending"
        });

        return res.status(200).json({
            message: "No match found. We will notify you when a match is uploaded."
        });

    } catch (error) {
        console.error("Upload Selfie Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

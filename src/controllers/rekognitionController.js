import { rekognition, s3 } from "../config/aws.js";

export const findMatchingPhotos = async (req, res) => {
    try {
        const bucketName = "freshfocuzstudio";

        // Step 1: Get the latest uploaded selfie from "selfies/" folder
        const selfiesList = await s3.listObjectsV2({
            Bucket: bucketName,
            Prefix: "event-01/"
        }).promise();

        if (!selfiesList.Contents || selfiesList.Contents.length === 0) {
            return res.status(404).json({ error: "No selfies found" });
        }

        // Sort selfies by last modified time (latest first)
        const latestSelfie = selfiesList.Contents
            .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
            .shift(); // Get the most recent selfie

        const selfieKey = latestSelfie.Key;
        console.log("Latest uploaded selfie:", selfieKey);

        // Step 2: Fetch all event photos (from all event folders)
        const eventPhotosList = await s3.listObjectsV2({
            Bucket: bucketName,
            Prefix: "event-"
        }).promise();

        if (!eventPhotosList.Contents || eventPhotosList.Contents.length === 0) {
            return res.status(404).json({ error: "No event photos found" });
        }

        let matchedPhotos = [];

        // Step 3: Compare the latest selfie with all event photos
        for (const photo of eventPhotosList.Contents) {
            if (photo.Key.endsWith("/")) continue; // Ignore folders

            const compareParams = {
                SourceImage: { S3Object: { Bucket: bucketName, Name: selfieKey } },
                TargetImage: { S3Object: { Bucket: bucketName, Name: photo.Key } },
                SimilarityThreshold: 90
            };

            try {
                const result = await rekognition.compareFaces(compareParams).promise();

                if (result.FaceMatches.length > 0) {
                    matchedPhotos.push(`https://${bucketName}.s3.amazonaws.com/${photo.Key}`);
                }
            } catch (err) {
                console.error(`Error comparing faces for ${photo.Key}:`, err);
            }
        }

        res.json({ matchedPhotos });

    } catch (error) {
        console.error("Error in findMatchingPhotos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

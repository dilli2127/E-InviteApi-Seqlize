import { compareFaces } from "../../service/rekognitionService.js";
import MatchRequest from "../models/MatchRequest.js";

export const uploadEventPhoto = async (req, res) => {
    const photoFile = req.file;

    if (!photoFile) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const pendingRequests = await MatchRequest.findAll({ where: { status: "pending" } });

        for (const request of pendingRequests) {
            const isMatch = await compareFaces(request.selfieKey, photoFile.key);
            if (isMatch) {
                request.status = "matched";
                request.matchedPhotoKey = photoFile.key;
                await request.save();

                // TODO: Integrate WhatsApp API to send notification
                console.log(`Match found for ${request.userPhone}. Notify via WhatsApp!`);
            }
        }

        res.status(200).json({ message: "Photo uploaded successfully." });

    } catch (error) {
        console.error("Upload Event Photo Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

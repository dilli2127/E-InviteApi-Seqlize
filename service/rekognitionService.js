import { rekognition, s3 } from "../src/config/aws.js";

export const compareFaces = async (sourceKey, targetKey) => {
    try {
        const sourceImage = await s3.getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: sourceKey
        }).promise();

        const targetImage = await s3.getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: targetKey
        }).promise();

        const params = {
            SourceImage: { Bytes: sourceImage.Body },
            TargetImage: { Bytes: targetImage.Body },
            SimilarityThreshold: 80
        };

        const response = await rekognition.compareFaces(params).promise();
        return response.FaceMatches.length > 0;  // Returns true if match found
    } catch (error) {
        console.error("Rekognition error:", error);
        return false;
    }
};

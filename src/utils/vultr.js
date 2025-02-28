/* eslint-disable promise/prefer-await-to-callbacks */
import fs from "fs/promises";
import * as Minio from "minio";
import logger from "./logger.js";
import sharp from "sharp";
import {
    vultrAccessKey,
    vultrSecretKey,
    vultrRegion,
    vultrBucketName,
    vultrS3Endpoint,
} from "../config/environment.js";

// Initialize Minio client (compatible with Vultr S3)
const vultrClient = new Minio.Client({
    endPoint: `${vultrRegion}.vultrobjects.com`, // Use region endpoint (remove https://)
    useSSL: true, // Vultr Object Storage always uses SSL
    accessKey: vultrAccessKey,
    secretKey: vultrSecretKey,
    s3ForcePathStyle: true,
});

// Ensure bucket exists
(async () => {
    try {
        const bucketExists = await vultrClient.bucketExists(vultrBucketName);
        if (!bucketExists) {
            console.error(
                "Bucket does not exist. You must create it manually in Vultr console.",
            );
            process.exit(1); // Exit if bucket doesn't exist
        }

        console.log("Bucket exists.");
    } catch (err) {
        console.error("Error in bucket setup:", err);
    }
})();

/**
 * Upload an image to Vultr S3 bucket
 * @param {string} key - Unique key for the image
 * @param {string} path - Local file path
 * @returns {Promise<{Location: string}>} - URL of the uploaded image
 */
export async function uploadImage(key, path) {
    try {
        const metaData = {}; // Add any custom metadata if needed

        // Upload the file to the public bucket
        await vultrClient.fPutObject(vultrBucketName, key, path, metaData);

        // Delete the local file after upload
        await fs.unlink(path);

        // Construct the URL to access the image (public access)
        const url = constructUrl(key);
        return {Location: url};
    } catch (err) {
        logger("Error uploading image: ", err);
        throw err;
    }
}

/**
 * Delete an image from Vultr S3 bucket
 * @param {string} key - Unique key for the image
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteImage(key) {
    try {
        await vultrClient.removeObject(vultrBucketName, key);
        logger("Image deleted successfully");
        return true;
    } catch (err) {
        logger("Error deleting image: ", err);
        throw err;
    }
}

/**
 * Construct the URL for accessing the image (Public URL if bucket allows public read)
 * @param {string} key - Unique key for the image
 * @returns {string} - Publicly accessible URL
 */
function constructUrl(key) {
    // Vultr S3 URLs are in the format:
    // https://<bucket-name>.<region>.vultrobjects.com/<key>
    return `https://${vultrBucketName}.${vultrRegion}.vultrobjects.com/${key}`;
}

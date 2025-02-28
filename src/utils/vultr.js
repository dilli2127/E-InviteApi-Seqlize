import fs from "fs/promises";
import * as Minio from "minio";
import logger from "./logger.js";
import {Readable} from "stream";
import sharp from "sharp";
import path from "path"; // Ensure path module is imported
import {fileURLToPath} from "url"; // For converting __dirname

import {
    vultrAccessKey,
    vultrSecretKey,
    vultrRegion,
    vultrBucketName,
    vultrS3Endpoint,
} from "../config/environment.js";

// Get the directory name using fileURLToPath and import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * @param {string} filePath - Local file path
 * @returns {Promise<{Location: string}>} - URL of the uploaded image
 */
export async function uploadImageCompressed(key, filePath) {
    try {
        // Compress the image using sharp and get the compressed image as a buffer
        const compressedBuffer = await sharp(filePath)
            .resize(1200) // Resize if needed (optional)
            .jpeg({quality: 90}) // Set compression quality (optional)
            .toBuffer();

        const metaData = {}; // Add any custom metadata if needed

        // Create a readable stream from the buffer
        const bufferStream = Readable.from(compressedBuffer);

        // Upload the compressed buffer to the Vultr S3 bucket using putObject
        await vultrClient.putObject(
            vultrBucketName,
            key,
            bufferStream,
            metaData,
        );

        // Construct the URL to access the image (public access)
        const url = constructUrl(key);

        // Optionally, delete the original file if needed
        // await fs.unlink(filePath);
        return {Location: url};
    } catch (err) {
        logger("Error uploading image: ", err);
        throw err;
    }
}

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

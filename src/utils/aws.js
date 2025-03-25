import fs from "fs/promises";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./logger.js";
import {
    awsAccessKey,
    awsSecretKey,
    awsRegion,
    awsBucketName,
} from "../config/environment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize AWS S3 client
const s3Client = new S3Client({
    region: awsRegion,
    credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
    },
});

/**
 * Upload a compressed image to AWS S3 bucket
 * @param {string} key - Unique key for the image
 * @param {string} filePath - Local file path
 * @returns {Promise<{Location: string}>} - URL of the uploaded image
 */
export async function AwsuploadImageCompressed(key, filePath) {
    try {
        // Compress the image using sharp
        const compressedBuffer = await sharp(filePath)
            .resize(1200)
            .jpeg({ quality: 90 })
            .toBuffer();

        // Create a readable stream from the buffer
        const bufferStream = Readable.from(compressedBuffer);

        // Upload the image to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: awsBucketName,
            Key: key,
            Body: bufferStream,
            ContentType: "image/jpeg",
        }));

        // Construct the S3 URL
        const url = constructUrl(key);
        return { Location: url };
    } catch (err) {
        logger("Error uploading image: ", err);
        throw err;
    }
}

/**
 * Upload an image to AWS S3 bucket
 * @param {string} key - Unique key for the image
 * @param {string} filePath - Local file path
 * @returns {Promise<{Location: string}>} - URL of the uploaded image
 */
export async function uploadImage(key, filePath) {
    try {
        const fileData = await fs.readFile(filePath);

        // Upload file to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: awsBucketName,
            Key: key,
            Body: fileData,
        }));

        // Delete local file after upload
        await fs.unlink(filePath);

        const url = constructUrl(key);
        return { Location: url };
    } catch (err) {
        logger("Error uploading image: ", err);
        throw err;
    }
}

/**
 * Delete an image from AWS S3 bucket
 * @param {string} key - Unique key for the image
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteImage(key) {
    try {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: awsBucketName,
            Key: key,
        }));
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
    return `https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/${key}`;
}

import fs from "fs/promises";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import mime from "mime-types"; // Import MIME type detector
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
const s3 = new S3Client({
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
        let fileStat;
        try {
            fileStat = await fs.stat(filePath);
        } catch (error) {
            throw new Error(`File not found: ${filePath}`);
        }

        if (!fileStat.isFile()) {
            throw new Error(`Invalid file path: ${filePath}`);
        }

        // Compress the image using sharp
        const compressedBuffer = await sharp(filePath)
            .resize(1200)
            .jpeg({ quality: 90 })
            .toBuffer();

        if (!compressedBuffer || compressedBuffer.length === 0) {
            throw new Error("Error: Compressed buffer is empty!");
        }

        // Upload the image to S3
        await s3.send(new PutObjectCommand({
            Bucket: awsBucketName,
            Key: key,
            Body: compressedBuffer,
            ContentType: "image/jpeg",
        }));

        return { Location: constructUrl(key) };
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
        const contentType = mime.lookup(filePath) || "application/octet-stream";

        // Upload file to S3
        await s3.send(new PutObjectCommand({
            Bucket: awsBucketName,
            Key: key,
            Body: fileData,
            ContentType: contentType,
        }));

        // Delete local file after successful upload
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
        await s3.send(new DeleteObjectCommand({
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

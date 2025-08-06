import fs from "fs/promises";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import mime from "mime-types";
import logger from "./logger.js";
import {
    awsAccessKey,
    awsSecretKey,
    awsRegion,
    awsBucketName,
} from "../config/environment.js";

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
 * @param {Object} [options] - Compression options
 * @param {number} [options.quality=90] - WebP quality (1-100)
 * @param {number} [options.maxWidth] - Maximum width for resizing
 * @param {number} [options.maxHeight] - Maximum height for resizing
 * @returns {Promise<{Location: string, size: number}>} - URL and size of the uploaded image
 */
export async function AwsuploadImageCompressed(key, filePath, options = {}) {
    // Input validation
    if (!key || typeof key !== 'string') {
        throw new Error('Invalid key: must be a non-empty string');
    }
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid filePath: must be a non-empty string');
    }

    const { quality = 90, maxWidth, maxHeight } = options;

    try {
        // Check if file exists and is valid
        const fileStat = await fs.stat(filePath);
        if (!fileStat.isFile()) {
            throw new Error(`Invalid file path: ${filePath}`);
        }

        // Build sharp processing chain
        let sharpProcessor = sharp(filePath);
        
        // Apply resizing if specified
        if (maxWidth || maxHeight) {
            sharpProcessor = sharpProcessor.resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        
        // Apply WebP compression
        const compressedBuffer = await sharpProcessor
            .webp({ quality: Math.max(1, Math.min(100, quality)) })
            .toBuffer();

        if (!compressedBuffer?.length) {
            throw new Error('Failed to compress image: empty buffer');
        }

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: awsBucketName,
            Key: key,
            Body: compressedBuffer,
            ContentType: 'image/webp',
            CacheControl: 'max-age=31536000', // 1 year cache
        });

        await s3.send(command);
        
        logger(`Image uploaded successfully: ${key} (${compressedBuffer.length} bytes)`);
        return { 
            Location: constructUrl(key),
            size: compressedBuffer.length
        };
    } catch (err) {
        logger(`Error uploading compressed image ${key}:`, err.message);
        throw new Error(`Upload failed: ${err.message}`);
    }
}

/**
 * Upload an image to AWS S3 bucket (original format)
 * @param {string} key - Unique key for the image
 * @param {string} filePath - Local file path
 * @param {boolean} [deleteLocal=true] - Whether to delete local file after upload
 * @returns {Promise<{Location: string, size: number, contentType: string}>} - Upload result
 */
export async function uploadImage(key, filePath, deleteLocal = true) {
    // Input validation
    if (!key || typeof key !== 'string') {
        throw new Error('Invalid key: must be a non-empty string');
    }
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid filePath: must be a non-empty string');
    }

    try {
        // Check file exists before reading
        const fileStat = await fs.stat(filePath);
        if (!fileStat.isFile()) {
            throw new Error(`Invalid file path: ${filePath}`);
        }

        const [fileData, contentType] = await Promise.all([
            fs.readFile(filePath),
            Promise.resolve(mime.lookup(filePath) || 'application/octet-stream')
        ]);

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: awsBucketName,
            Key: key,
            Body: fileData,
            ContentType: contentType,
            CacheControl: 'max-age=31536000', // 1 year cache
        });

        await s3.send(command);

        // Delete local file if requested
        if (deleteLocal) {
            try {
                await fs.unlink(filePath);
            } catch (unlinkErr) {
                logger(`Warning: Could not delete local file ${filePath}:`, unlinkErr.message);
            }
        }

        logger(`Image uploaded successfully: ${key} (${fileData.length} bytes)`);
        return { 
            Location: constructUrl(key),
            size: fileData.length,
            contentType
        };
    } catch (err) {
        logger(`Error uploading image ${key}:`, err.message);
        throw new Error(`Upload failed: ${err.message}`);
    }
}

/**
 * Delete an image from AWS S3 bucket
 * @param {string} key - Unique key for the image
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteImage(key) {
    // Input validation
    if (!key || typeof key !== 'string') {
        throw new Error('Invalid key: must be a non-empty string');
    }

    try {
        const command = new DeleteObjectCommand({
            Bucket: awsBucketName,
            Key: key,
        });
        
        await s3.send(command);
        logger(`Image deleted successfully: ${key}`);
        return true;
    } catch (err) {
        logger(`Error deleting image ${key}:`, err.message);
        throw new Error(`Delete failed: ${err.message}`);
    }
}

/**
 * Construct the URL for accessing the image (Public URL if bucket allows public read)
 * @param {string} key - Unique key for the image
 * @returns {string} - Publicly accessible URL
 */
function constructUrl(key) {
    if (!key) {
        throw new Error('Invalid key: cannot construct URL for empty key');
    }
    return `https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/${encodeURIComponent(key)}`;
}

/**
 * Batch delete multiple images from AWS S3 bucket
 * @param {string[]} keys - Array of unique keys for the images
 * @returns {Promise<{deleted: string[], failed: Array<{key: string, error: string}>}>} - Batch delete result
 */
export async function batchDeleteImages(keys) {
    if (!Array.isArray(keys) || keys.length === 0) {
        throw new Error('Invalid keys: must be a non-empty array');
    }

    const deleted = [];
    const failed = [];

    // Process deletions in parallel with concurrency limit
    const concurrency = 10;
    for (let i = 0; i < keys.length; i += concurrency) {
        const batch = keys.slice(i, i + concurrency);
        const promises = batch.map(async (key) => {
            try {
                await deleteImage(key);
                deleted.push(key);
            } catch (err) {
                failed.push({ key, error: err.message });
            }
        });
        
        await Promise.allSettled(promises);
    }

    logger(`Batch delete completed: ${deleted.length} deleted, ${failed.length} failed`);
    return { deleted, failed };
}

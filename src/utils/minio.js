/* eslint-disable promise/prefer-await-to-callbacks */
import fs from "fs/promises";
import * as Minio from "minio";
import logger from "./logger.js";
import {
  imageBucketName,
  minioAccessKey,
  minioSecretKey,
  minioRegion,
  minioEndpoint,
  minioPort,
  minioUseSslPrefix,
  minioPrefix,
} from "../config/environment.js";

// Initialize Minio client
const minioClient = new Minio.Client({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: minioUseSslPrefix,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
});

// Ensure bucket exists and set bucket policy
(async () => {
    try {
      const bucketExists = await minioClient.bucketExists(imageBucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(imageBucketName, minioRegion);
        console.log("Bucket created successfully");
      }
  
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicRead",
            Effect: "Allow",
            Principal: "*",  // Public access
            Action: ["s3:GetObject"],  // Allows read access
            Resource: [`arn:aws:s3:::${imageBucketName}/*`],  // Applies to all objects in the bucket
          },
        ],
      };
      // Stringify the policy and set it
      const policyString = JSON.stringify(policy);
      await minioClient.setBucketPolicy(imageBucketName, policyString);
      console.log("Bucket policy applied successfully");
    } catch (err) {
      console.error("Error in bucket setup:", err);
    }
  })();
  

/**
 * Upload an image to the Minio bucket
 * @param {string} key - Unique key for the image
 * @param {string} path - Local file path
 * @returns {Promise<{Location: string}>} - URL of the uploaded image
 */
export async function uploadImage(key, path) {
  try {
    const metaData = {}; // Add any custom metadata if needed
    await minioClient.fPutObject(imageBucketName, key, path, metaData);
    const url = constructUrl(key);

    // Delete the local file after upload
    await fs.unlink(path);
    // logger("Image uploaded and local file deleted successfully");

    return { Location: url };
  } catch (err) {
    logger("Error uploading image: ", err);
    throw err;
  }
}

/**
 * Delete an image from the Minio bucket
 * @param {string} key - Unique key for the image
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteImage(key) {
  try {
    await minioClient.removeObject(imageBucketName, key);
    logger("Image deleted successfully");
    return true;
  } catch (err) {
    logger("Error deleting image: ", err);
    throw err;
  }
}

/**
 * Construct the URL for accessing the image
 * @param {string} key - Unique key for the image
 * @returns {string} - Publicly accessible URL
 */
function constructUrl(key) {
  const protocol = minioUseSslPrefix ? "https://" : "http://";
  let host = minioPrefix || minioEndpoint;
  if (minioPort && !minioPrefix) {
    host += `:${minioPort}`;
  }
  return `${protocol}${host}/${imageBucketName}/${key}`;
}

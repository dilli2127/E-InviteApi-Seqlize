import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import sharp from 'sharp';
import poppler from 'pdf-poppler';
import dotenv from 'dotenv';
import { promisify } from 'util';
import { genericResponse } from './base_controllers.js';
import { statusCodes } from '../config/constants.js';

dotenv.config();

const uploadsFolder = path.join(process.cwd(), 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder);
}

// Configure S3 (Vultr-compatible)
const s3 = new AWS.S3({
    endpoint: process.env.VULTR_S3_ENDPOINT,
    accessKeyId: process.env.VULTR_ACCESS_KEY,
    secretAccessKey: process.env.VULTR_SECRET_KEY,
    region: process.env.VULTR_REGION,
    s3ForcePathStyle: true,
});

// Function to safely delete folder (handles Windows file-lock issue)
const delay = promisify(setTimeout);

async function safeDeleteFolder(folderPath) {
    try {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
    } catch (err) {
        console.warn(`Failed to delete folder: ${folderPath}. Retrying in 1 second.`);
        await delay(1000);
        try {
            if (fs.existsSync(folderPath)) {
                fs.rmSync(folderPath, { recursive: true, force: true });
            }
        } catch (finalErr) {
            console.error(`Final cleanup failed for folder: ${folderPath}`, finalErr.message);
        }
    }
}

// Convert PDF to images using pdf-poppler
async function convertPdfToImages(pdfPath, outputFolder) {
    const opts = {
        format: 'jpeg',
        out_dir: outputFolder,
        out_prefix: 'page',
        // scale: 1000 // High-resolution images
    };

    await poppler.convert(pdfPath, opts);

    const files = fs.readdirSync(outputFolder).filter(file => file.endsWith('.jpg'));
    return files.map(file => path.join(outputFolder, file));
}

// Upload image to Vultr S3
async function uploadImageToVultr(localPath, albumName, pageIndex) {
    const imageBuffer = await sharp(localPath)
        .png({ compressionLevel: 0 })  // No compression, max quality
        .toBuffer();

    const uploadKey = `albums/${albumName}/page-${pageIndex + 1}.jpeg`;

    const params = {
        Bucket: process.env.VULTR_BUCKET_NAME,
        Key: uploadKey,
        Body: imageBuffer,
        ContentType: 'image/png',   // Change to PNG
        ACL: 'public-read',
    };

    await s3.upload(params).promise();

    return `${process.env.VULTR_S3_ENDPOINT}/${process.env.VULTR_BUCKET_NAME}/${uploadKey}`;
}



// Main album upload function
export async function uploadAlbum(req, res, next) {
    const { albumName } = req.body;

    if (!albumName) {
        return genericResponse({
            res,
            result: null,
            exception: 'Album name is required',
            pagination: null,
            statusCode: statusCodes.BAD_REQUEST,
        });
    }

    if (!req.file) {
        return genericResponse({
            res,
            result: null,
            exception: 'PDF file is required',
            pagination: null,
            statusCode: statusCodes.BAD_REQUEST,
        });
    }

    const pdfPath = req.file.path;
    const albumFolder = path.join(uploadsFolder, albumName);

    if (!fs.existsSync(albumFolder)) {
        fs.mkdirSync(albumFolder, { recursive: true });
    }

    try {
        const imagePaths = await convertPdfToImages(pdfPath, albumFolder);
        const uploadedImages = [];

        for (let i = 0; i < imagePaths.length; i++) {
            const imageUrl = await uploadImageToVultr(imagePaths[i], albumName, i);
            uploadedImages.push(imageUrl);
        }

        return genericResponse({
            res,
            result: { message: 'Album uploaded successfully', images: uploadedImages },
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });

    } catch (error) {
        console.error('Upload Album Error:', error);
        return next(error);
    }  finally {
        // Add some delay to allow Windows to release locks
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
    
        // Attempt cleanup
        await safeDeleteFolder(albumFolder);
    
        if (fs.existsSync(pdfPath)) {
            try {
                fs.unlinkSync(pdfPath);
            } catch (unlinkErr) {
                console.error('Failed to delete PDF file:', pdfPath, unlinkErr.message);
            }
        }
    
        sharp.cache(false);
    }
}

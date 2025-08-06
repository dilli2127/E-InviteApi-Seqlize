import apiService from "axios";
import request from "request-promise";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import archiver from "archiver";
import {genericResponse} from "./base_controllers.js";
import {
    statusCodes,
    FILE_SIZE_LIMT,
    FILE_MIN_SIZE,
    ALLOWED_MIME_TYPES_UPLOAD,
    OTHER_MIME_TYPES_UPLOAD,
    ALLOWED_EXT_UPLOAD,
    OTHER_ALLOWED_EXT_UPLOAD,
} from "../config/constants.js";
import logger from "../utils/logger.js";
import {getFileExtension} from "../utils/file_upload.js";
import * as ENV from "../config/environment.js";
import { AwsuploadImageCompressed, uploadImage, deleteImage } from "../utils/aws.js";

// Cache for file stats to avoid repeated disk access
const fileStatsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to clean up file stats cache
function cleanupCache() {
    const now = Date.now();
    for (const [key, { timestamp }] of fileStatsCache.entries()) {
        if (now - timestamp > CACHE_TTL) {
            fileStatsCache.delete(key);
        }
    }
}

// Optimized async file size checking with caching
export async function checkFileSizeAsync(imagePath) {
    try {
        // Check cache first
        const cacheKey = `${imagePath}-${Date.now()}`;
        const cached = fileStatsCache.get(imagePath);
        
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            return cached.stats;
        }

        const stats = await fsPromises.stat(imagePath);
        const imageSizeInKB = stats.size / 1024;
        
        // Cache the result
        fileStatsCache.set(imagePath, {
            stats: { sizeInKB: imageSizeInKB, size: stats.size },
            timestamp: Date.now()
        });
        
        // Cleanup old cache entries periodically
        if (fileStatsCache.size > 100) {
            cleanupCache();
        }
        
        return { sizeInKB: imageSizeInKB, size: stats.size };
    } catch (error) {
        logger(`Error checking file size for ${imagePath}: ${error.message}`, "e");
        return null;
    }
}

export async function validateFileSize(imagePath) {
    const fileStats = await checkFileSizeAsync(imagePath);
    if (!fileStats) return { valid: false, error: "Unable to read file" };
    
    const { sizeInKB } = fileStats;
    
    if (sizeInKB > FILE_SIZE_LIMT) {
        return { valid: false, error: "File too large" };
    }
    
    if (sizeInKB < FILE_MIN_SIZE) {
        return { valid: false, error: "File too small" };
    }
    
    return { valid: true, sizeInKB };
}

// Legacy sync functions for backward compatibility
export function checkIfFileSizeIsUnderLimit(imagePath) {
    try {
        const stats = fs.statSync(imagePath);
        const imageSizeInKB = stats.size / 1024;
        return imageSizeInKB <= FILE_SIZE_LIMT;
    } catch (error) {
        logger(`Error in checkIfFileSizeIsUnderLimit: ${error.message}`, "e");
        return false;
    }
}

export function checkIfFileSizeIsOverMinLimit(imagePath) {
    try {
        const stats = fs.statSync(imagePath);
        const imageSizeInKB = stats.size / 1024;
        return imageSizeInKB >= FILE_MIN_SIZE;
    } catch (error) {
        logger(`Error in checkIfFileSizeIsOverMinLimit: ${error.message}`, "e");
        return false;
    }
}

export async function _urlToBase64(url) {
    // Input validation
    if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided');
    }
    
    // Basic URL validation
    try {
        new URL(url);
    } catch {
        throw new Error('Invalid URL format');
    }

    try {
        const response = await apiService.request({
            method: "GET",
            url,
            responseType: "arraybuffer",
            timeout: 30000, // 30 second timeout
            maxContentLength: FILE_SIZE_LIMT * 1024, // Respect file size limit
            maxRedirects: 5,
        });
        
        if (!response || response.status !== 200) {
            throw new Error(`HTTP ${response?.status || 'unknown'}: Error fetching image`);
        }

        const contentType = response.headers["content-type"] || 'application/octet-stream';
        const base64Data = Buffer.from(response.data).toString("base64");
        
        return `data:${contentType};base64,${base64Data}`;
    } catch (error) {
        logger(`Error converting URL to base64: ${error.message}`, "e");
        throw new Error(`Failed to convert URL to base64: ${error.message}`);
    }
}

export async function urlToBase64(req, res, next) {
    try {
        const { url } = req.body || {};
        
        // Enhanced validation
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return genericResponse({
                res,
                result: null,
                exception: "Invalid or missing URL",
                pagination: null,
                stringResult: "Invalid or missing URL",
                statusCode: statusCodes.INVALID_DATA,
            });
        }

        const response = await _urlToBase64(url.trim());

        return genericResponse({
            res,
            result: response,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        logger(`Error in urlToBase64: ${error.message}`, "e");
        return genericResponse({
            res,
            result: null,
            exception: error.message,
            pagination: null,
            stringResult: error.message,
            statusCode: statusCodes.SERVER_ERROR,
        });
    }
}

export async function uploadFiles(req, res, next) {
    try {
        const uploadResults = {};
        const files = req.files || [];
        
        // Early validation
        if (!files.length) {
            return genericResponse({
                res,
                result: null,
                exception: "No files provided",
                pagination: null,
                stringResult: "No files provided",
                statusCode: statusCodes.INVALID_DATA,
            });
        }

        // Validate file extensions efficiently
        const invalidFiles = files.filter(file => {
            const extensions = file.originalname.split(".");
            return extensions.length > 2 || extensions.length < 2;
        });

        if (invalidFiles.length > 0) {
            return genericResponse({
                res,
                result: null,
                exception: "Invalid file extensions detected",
                pagination: null,
                stringResult: "Invalid file extensions detected",
                statusCode: statusCodes.INVALID_DATA,
            });
        }

        // Process files with proper error handling
        const uploadPromises = files.map(async (file) => {
            try {
                // Validate file size using optimized async function
                const sizeValidation = await validateFileSize(file.path);
                if (!sizeValidation.valid) {
                    return {
                        fieldname: file.fieldname,
                        success: false,
                        error: sizeValidation.error
                    };
                }

                const fileExtension = path.extname(file.originalname);
                if (!fileExtension) {
                    return {
                        fieldname: file.fieldname,
                        success: false,
                        error: "Missing file extension"
                    };
                }

                const actualFileName = file.filename;
                const s3Key = `files/${actualFileName}${fileExtension}`;
                
                const uploadedFile = await AwsuploadImageCompressed(s3Key, file.path);
                
                let finalUrl = uploadedFile.Location;
                if (ENV.prod && uploadedFile.Location) {
                    finalUrl = uploadedFile.Location.replace("files/", "");
                }

                // Clean up temporary file after successful upload
                try {
                    await fsPromises.unlink(file.path);
                } catch (cleanupError) {
                    logger(`Warning: Could not delete temp file ${file.path}: ${cleanupError.message}`, "w");
                }

                return {
                    fieldname: file.fieldname,
                    success: true,
                    url: finalUrl
                };
            } catch (uploadError) {
                logger(`Upload error for file ${file.originalname}: ${uploadError.message}`, "e");
                return {
                    fieldname: file.fieldname,
                    success: false,
                    error: `Upload failed: ${uploadError.message}`
                };
            }
        });

        const results = await Promise.allSettled(uploadPromises);
        
        // Process results
        const errors = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const uploadResult = result.value;
                if (uploadResult.success) {
                    uploadResults[uploadResult.fieldname] = uploadResult.url;
                } else {
                    errors.push(`${uploadResult.fieldname}: ${uploadResult.error}`);
                }
            } else {
                const file = files[index];
                errors.push(`${file.fieldname}: ${result.reason}`);
            }
        });

        // Return appropriate response
        if (errors.length > 0) {
            return genericResponse({
                res,
                result: uploadResults,
                exception: errors.join('; '),
                pagination: null,
                stringResult: `Upload completed with errors: ${errors.join('; ')}`,
                statusCode: Object.keys(uploadResults).length > 0 ? statusCodes.SUCCESS : statusCodes.SERVER_ERROR,
            });
        }

        return genericResponse({
            res,
            result: uploadResults,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        logger(`Critical error in uploadFiles: ${error.message}`, "e");
        return next(error);
    }
}



export async function deleteFiles(req, res, next) {
    try {
        const { Urls } = req.body || {};
        
        // Input validation
        if (!Urls || !Array.isArray(Urls) || Urls.length === 0) {
            return genericResponse({
                res,
                result: null,
                exception: "No URLs provided for deletion",
                pagination: null,
                stringResult: "No URLs provided for deletion",
                statusCode: statusCodes.INVALID_DATA,
            });
        }

        // Process deletions with error handling
        const deletePromises = Urls.map(async (url) => {
            try {
                if (!url || typeof url !== 'string') {
                    return { url, success: false, error: 'Invalid URL' };
                }
                
                // Extract key more safely
                const urlParts = url.split('/files/');
                if (urlParts.length < 2) {
                    return { url, success: false, error: 'Invalid URL format' };
                }
                
                const key = `files/${urlParts[1]}`;
                await deleteImage(key);
                
                return { url, success: true };
            } catch (deleteError) {
                logger(`Error deleting file ${url}: ${deleteError.message}`, "e");
                return { url, success: false, error: deleteError.message };
            }
        });

        const results = await Promise.allSettled(deletePromises);
        
        // Analyze results
        const errors = [];
        const successful = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const deleteResult = result.value;
                if (deleteResult.success) {
                    successful.push(deleteResult.url);
                } else {
                    errors.push(`${deleteResult.url}: ${deleteResult.error}`);
                }
            } else {
                errors.push(`${Urls[index]}: ${result.reason}`);
            }
        });

        return genericResponse({
            res,
            result: {
                deletedCount: successful.length,
                totalCount: Urls.length,
                errors: errors.length > 0 ? errors : null
            },
            exception: errors.length > 0 ? `${errors.length} deletion(s) failed` : null,
            pagination: null,
            statusCode: successful.length > 0 ? statusCodes.SUCCESS : statusCodes.SERVER_ERROR,
        });
    } catch (error) {
        logger(`Critical error in deleteFiles: ${error.message}`, "e");
        return next(error);
    }
}

export async function uploadExcel(filePath, actualFileName) {
    try {
        // Input validation
        if (!filePath || !actualFileName) {
            throw new Error('FilePath and actualFileName are required');
        }
        
        // Validate file exists
        try {
            await fsPromises.access(filePath);
        } catch {
            throw new Error(`File not found: ${filePath}`);
        }
        
        const fileExtension = ".xlsx";
        const s3Key = `files/${actualFileName}${fileExtension}`;

        const uploadedFile = await uploadImage(s3Key, filePath);
        
        if (!uploadedFile || !uploadedFile.Location) {
            throw new Error('Upload failed - no location returned');
        }
        
        let finalUrl = uploadedFile.Location;
        if (ENV.prod) {
            finalUrl = uploadedFile.Location.replace("files/", "");
        }
        
        // Clean up temporary file
        try {
            await fsPromises.unlink(filePath);
        } catch (cleanupError) {
            logger(`Warning: Could not delete temp Excel file ${filePath}: ${cleanupError.message}`, "w");
        }
        
        return finalUrl;
    } catch (error) {
        logger(`Error uploading Excel file: ${error.message}`, "e");
        throw error;
    }
}

export async function uploadZip(filePath, actualFileName) {
    try {
        // Input validation
        if (!filePath || !actualFileName) {
            throw new Error('FilePath and actualFileName are required');
        }
        
        // Validate file exists
        try {
            await fsPromises.access(filePath);
        } catch {
            throw new Error(`Zip file not found: ${filePath}`);
        }
        
        const fileExtension = ".zip";
        const s3Key = `zip/${actualFileName}${fileExtension}`;

        const uploadedFile = await uploadImage(s3Key, filePath);
        
        if (!uploadedFile || !uploadedFile.Location) {
            throw new Error('Zip upload failed - no location returned');
        }
        
        // Clean up temporary file
        try {
            await fsPromises.unlink(filePath);
        } catch (cleanupError) {
            logger(`Warning: Could not delete temp zip file ${filePath}: ${cleanupError.message}`, "w");
        }
        
        return uploadedFile.Location;
    } catch (error) {
        logger(`Error uploading zip file: ${error.message}`, "e");
        throw error;
    }
}

export async function zipFile(pathToFiles, name, nameSuffix = "") {
    return new Promise((resolve, reject) => {
        try {
            // Input validation
            if (!pathToFiles || !name) {
                reject(new Error('pathToFiles and name are required'));
                return;
            }
            
            // Sanitize filename to prevent path traversal
            const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
            const sanitizedSuffix = nameSuffix.replace(/[^a-zA-Z0-9-_]/g, '_');
            
            const zipPath = `./Attachments/${sanitizedName}-${sanitizedSuffix}.zip`;
            const zipStream = fs.createWriteStream(zipPath);
            const archive = archiver("zip", {
                zlib: { level: 6 }, // Balanced compression (was 9, too CPU intensive)
                gzip: false
            });

            // Set up error handling before starting
            zipStream.on("error", (err) => {
                logger(`Error with zip stream: ${err.message}`, "e");
                reject(err);
            });

            archive.on("error", (err) => {
                logger(`Error with archive: ${err.message}`, "e");
                reject(err);
            });

            archive.on("warning", (err) => {
                if (err.code === 'ENOENT') {
                    logger(`Warning in archive: ${err.message}`, "w");
                } else {
                    reject(err);
                }
            });

            zipStream.on("close", () => {
                const archiveSize = archive.pointer();
                logger(`Zip created successfully: ${zipPath} (${archiveSize} bytes)`, "i");
                resolve(zipPath);
            });

            // Check if source directory exists
            if (!fs.existsSync(pathToFiles)) {
                reject(new Error(`Source directory does not exist: ${pathToFiles}`));
                return;
            }

            archive.directory(pathToFiles, false);
            archive.pipe(zipStream);
            
            // Finalize with timeout
            const timeout = setTimeout(() => {
                reject(new Error('Zip creation timeout after 5 minutes'));
            }, 5 * 60 * 1000);
            
            archive.finalize().then(() => {
                clearTimeout(timeout);
            }).catch((err) => {
                clearTimeout(timeout);
                reject(err);
            });
            
        } catch (error) {
            logger(`Error in zipFile: ${error.message}`, "e");
            reject(error);
        }
    });
}

export async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        try {
            // Input validation
            if (!url || !destPath) {
                reject(new Error('URL and destination path are required'));
                return;
            }
            
            // Validate URL format
            try {
                new URL(url);
            } catch {
                reject(new Error('Invalid URL format'));
                return;
            }
            
            // Create write stream with error handling
            const file = fs.createWriteStream(destPath);
            
            file.on('error', (err) => {
                logger(`File stream error: ${err.message}`, "e");
                reject(err);
            });

            const requestOptions = {
                uri: url,
                timeout: 60000, // 60 second timeout
                maxRedirects: 5,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive',
                    'User-Agent': 'E-InviteAPI/1.0 (Node.js)'
                },
                gzip: true,
            };

            const requestStream = request(requestOptions);
            
            requestStream.on('error', (err) => {
                logger(`Request error: ${err.message}`, "e");
                file.destroy();
                // Clean up partial file
                fs.unlink(destPath, () => {});
                reject(err);
            });
            
            requestStream.on('response', (response) => {
                if (response.statusCode !== 200) {
                    const error = new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`);
                    file.destroy();
                    fs.unlink(destPath, () => {});
                    reject(error);
                    return;
                }
                
                // Check content length if available
                const contentLength = parseInt(response.headers['content-length'] || '0');
                if (contentLength > FILE_SIZE_LIMT * 1024) {
                    const error = new Error('File too large to download');
                    file.destroy();
                    fs.unlink(destPath, () => {});
                    reject(error);
                    return;
                }
            });

            requestStream
                .pipe(file)
                .on('finish', () => {
                    logger(`File download completed: ${destPath}`, "i");
                    resolve(destPath);
                })
                .on('error', (err) => {
                    logger(`Pipe error: ${err.message}`, "e");
                    file.destroy();
                    fs.unlink(destPath, () => {});
                    reject(err);
                });
                
        } catch (error) {
            logger(`Download error: ${error.message}`, "e");
            reject(error);
        }
    });
}

export async function filterFiles(req, res, next) {
    try {
        const files = req?.files;
        const userRole = res?.locals?.Role;
        
        // Input validation
        if (!files || !Array.isArray(files) || files.length === 0) {
            return genericResponse({
                res,
                result: null,
                exception: "No files provided",
                pagination: null,
                stringResult: "No files provided",
                statusCode: statusCodes.INVALID_DATA,
            });
        }

        // Determine allowed file types based on role
        const allowedMimeTypes = userRole === "Admin" 
            ? [...ALLOWED_MIME_TYPES_UPLOAD]
            : [...ALLOWED_MIME_TYPES_UPLOAD, ...OTHER_MIME_TYPES_UPLOAD];
            
        const allowedExtensions = userRole === "Admin"
            ? [...ALLOWED_EXT_UPLOAD]
            : [...ALLOWED_EXT_UPLOAD, ...OTHER_ALLOWED_EXT_UPLOAD];

        // Validate each file
        const validationErrors = [];
        const validFiles = [];
        
        for (const [index, file] of files.entries()) {
            const errors = [];
            
            // Basic file validation
            if (!file.originalname || !file.mimetype) {
                errors.push(`File ${index + 1}: Missing file name or mime type`);
                continue;
            }
            
            // Extract and validate extension
            const ext = getFileExtension(file.originalname);
            if (!ext) {
                errors.push(`File ${index + 1} (${file.originalname}): No file extension`);
            } else if (!allowedExtensions.includes(ext.toLowerCase())) {
                errors.push(`File ${index + 1} (${file.originalname}): Extension '${ext}' not allowed`);
            }
            
            // Validate mime type
            if (!allowedMimeTypes.includes(file.mimetype)) {
                errors.push(`File ${index + 1} (${file.originalname}): MIME type '${file.mimetype}' not allowed`);
            }
            
            // Additional security checks
            if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
                errors.push(`File ${index + 1} (${file.originalname}): Invalid characters in filename`);
            }
            
            if (errors.length > 0) {
                validationErrors.push(...errors);
            } else {
                validFiles.push(file);
            }
        }

        // Return validation errors if any
        if (validationErrors.length > 0) {
            const errorMessage = validationErrors.join('; ');
            logger(`File validation errors: ${errorMessage}`, "w");
            
            return genericResponse({
                res,
                result: {
                    validFiles: validFiles.length,
                    totalFiles: files.length,
                    errors: validationErrors
                },
                exception: "File validation failed",
                pagination: null,
                stringResult: errorMessage,
                statusCode: statusCodes.INVALID_DATA,
            });
        }

        // All files passed validation
        logger(`All ${files.length} files passed validation`, "i");
        next();
    } catch (error) {
        logger(`Error in filterFiles: ${error.message}`, "e");
        return next(error);
    }
}

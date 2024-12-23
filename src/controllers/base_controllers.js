import moment from "moment";
import * as ENV from "../config/environment.js";
import logger from "../utils/logger.js"; 

// Generic Response Handler
export function genericResponse({
    res,
    result,
    exception,
    pagination,
    stringResult,
    statusCode,
    errors = [],
    warnings = [],
}) {
    const response = {
        result,
        exception,
        pagination,
        stringResult,
        statusCode,
        errors,
        warnings,
    };

    // Ensure response headers are not already sent
    if (res && !res.headersSent) {
        res.json(response);
    }
}

// Date and Time Functions
export function getCurrentDateTime() {
    return new Date(moment().format());
}

export function getUtcUnix() {
    return Math.trunc(new Date(moment.utc()).getTime() / 1000);
}

export function getUtcMidnightUnixTime() {
    const utcDateTime = moment().utcOffset("+05:30").set({ hour: 0, minute: 0, second: 0 });
    return Math.trunc(utcDateTime.valueOf() / 1000);
}

export function getUtcDayEndUnixTime() {
    const utcDateTime = moment().utcOffset("+05:30").set({ hour: 23, minute: 59, second: 59 });
    return Math.trunc(utcDateTime.valueOf() / 1000);
}

export function getUtcmultiDaysUnixTime(days, period, setObj) {
    const utcDateTime = moment().utcOffset("+05:30").set(setObj).add(days, period);
    return Math.trunc(utcDateTime.valueOf() / 1000);
}

export function getUtcUnixInMilli() {
    return new Date(moment.utc()).getTime();
}

export function getCurrentUnixTime() {
    return getCurrentDateTime().getTime() / 1000;
}

export function getIndianDate() {
    return new Date(Date.now() + 5.5 * 60 * 60 * 1000);
}

export function getCurrentMidnightUnixTime() {
    const date = getCurrentDateTime();
    date.setHours(0, 0, 0, 0);
    return date.getTime() / 1000;
}

export function getCurrentDayEndUnixTime() {
    const date = getCurrentDateTime();
    date.setHours(23, 59, 59);
    return date.getTime() / 1000;
}

export function getCurrentMidnightUnixTimeInMilli() {
    const date = getCurrentDateTime();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

export function getCurrentUnixDate() {
    const currentTime = getCurrentDateTime();
    currentTime.setHours(0, 0, 0, 0);
    return currentTime.getTime() / 1000;
}

// Content Formatting
export async function formatContent({ content, values }) {
    try {
        const keys = [
            "TOOFFICERNAME", "TODESIGNATION", "TOAREA", "ADVOCATENAME",
            "OFFICERNAME", "DESIGNATION", "AREA", "CASENO", "FILEDDATE",
            "DATETIME", "RESPONDDATETIME", "OCM", "OTP", "ACTION", "SiteURL",
            "HEARINGNO", "AFFIDAVITCOUNT", "COUNTERAFFIDAVITCOUNT", "HEARINGCOUNT",
        ];

        keys.forEach(key => {
            const field = key.toLowerCase();
            const replaceRegEx = new RegExp(`##${key}##`, "g");
            content = content.replace(replaceRegEx, values[field]);
        });

        return content;
    } catch (error) {
        logger.error("Error in formatContent: ", error);
        throw error;
    }
}

// Saving Excel File
export async function saveExcel(wb, filePath) {
    return new Promise((resolve, reject) => {
        try {
            wb.write(filePath, (err) => {
                if (err) {
                    logger.error("Error saving Excel: ", err);
                    return reject(err);
                }
                resolve(filePath);
            });
        } catch (err) {
            logger.error("Error saving Excel: ", err);
            reject(err);
        }
    });
}

// Get Site URL based on Environment
export async function getSiteUrl() {
    let siteurl = "";
    switch (ENV.environment) {
        case "master":
            siteurl = "https://ocm.vertace.org";
            break;
        case "sit":
            siteurl = "https://ocm-sit.vertace.org";
            break;
        default:
            siteurl = "https://ocm-dev.vertace.org";
            break;
    }
    return siteurl;
}

// Validation Functions
export async function validateText(text) {
    const regex = /^[A-Za-z0-9 () / _.-]+$/;
    return regex.test(text);
}

export async function validatePassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

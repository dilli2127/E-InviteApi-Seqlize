export const statusCodes = {
    SUCCESS: "200",
    NOT_FOUND: "404",
    NOT_AUTHORIZED: "401",
    DUPLICATE: "409",
    SERVER_ERROR: "500",
    DATA_MISSING: "412",
    INVALID_DATA: "422",
    TOO_MANY_REQUESTS: "429",
    FORBIDDEN: "403",
};

export const otpExpirationTime = 1800;
export const otpRequestLimitTime = 120;

export const errorCodes = [
    {code: 1001, message: "Database error", resolution: ""},
];

export const warningCodes = [];

export const genericResult = {
    result: null,
    exception: null,
    pagination: null,
    errors: [],
    warnings: [],
    stringResult: statusCodes.SERVER_ERROR,
};

export const oneDaySeconds = 86400;
export const oneDayMillSeconds = 86400000;
export const oneHourSeconds = 3600;
export const sixhoursSeconds = 3600 * 6;
export const threehoursSeconds = 3600 * 3;
export const thirtyminutesSeconds = 1800;
export const jwt_expiresInHours = 3;
export const jwtExpirationTime = {
    days: 1,
    seconds: threehoursSeconds,
};

export const jwtExpirationTimeForAdmin = {
    days: 1,
    seconds: 7200, //2 hours
};
export const jwtExpirationTimeForOfficer = {
    days: 365,
    seconds: 86400, //1 day
};

export const captchaExpirationTime = {
    days: 1,
    seconds: 300, //5 minutes
};

export const FILE_SIZE_LIMT = 2000000; // KB (2GB)
export const FILE_MIN_SIZE = 5; // KB

export const ALLOWED_MIME_TYPES_UPLOAD = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/pdf",
];
export const OTHER_MIME_TYPES_UPLOAD = ["image/jpeg", "image/png"];
export const ALLOWED_EXT_UPLOAD = ["pdf", "doc", "docx"];
export const OTHER_ALLOWED_EXT_UPLOAD = ["jpg", "jpeg", "png"];
export const ALLOWED_DOMAINS = [
    /^(https:\/\/|http:\/\/)(www\.){0,1}localhost$/,
    /^(https:\/\/|http:\/\/)(www\.){0,1}tnpcb\.gov\.in$/,
    /^(https:\/\/|http:\/\/)(www\.){0,1}[0-9a-z_-]+\.vertace\.net$/,
    /^(https:\/\/|http:\/\/)(www\.){0,1}[0-9a-z_-]+\.vertace\.org$/,
    /^(https:\/\/|http:\/\/)(www\.){0,1}[0-9a-z_-]+\.vertace\.com$/,
];
export const MASTER_ALLOWED_DOMAINS = [
    /^(https:\/\/|http:\/\/)(www\.){0,1}tnpcb\.gov\.in$/,
    /^(https:\/\/|http:\/\/)(www\.){0,1}(pcb-ocm)\.vertace\.net$/,
    /^(https:\/\/|http:\/\/)(www\.){0,1}(pcb-ocm)\.vertace\.org$/,
    /^(https:\/\/|http:\/\/)(www\.){0,1}(pcb-ocm)\.vertace\.com$/,
];
export const DEFAULT_DOMAIN = "*.dilli.org";

export const caseUpdateCronScheduledTime = "*/60 * * * *";

export const _topLabelStyle = {
    font: {
        color: "#000000",
        size: 11,
        bold: true,
    },
    alignment: {
        wrapText: true,
        horizontal: "center",
        vertical: "center",
    },
    border: {
        left: {
            style: "thin",
            color: "black",
        },
        right: {
            style: "thin",
            color: "black",
        },
        top: {
            style: "thin",
            color: "black",
        },
        bottom: {
            style: "thin",
            color: "black",
        },
        outline: false,
    },
};
export const _headerStyle = {
    font: {
        color: "#000000",
        size: 11,
        bold: true,
    },
    alignment: {
        wrapText: true,
        horizontal: "center",
        vertical: "center",
    },
    border: {
        left: {
            style: "thin",
            color: "black",
        },
        right: {
            style: "thin",
            color: "black",
        },
        top: {
            style: "thin",
            color: "black",
        },
        bottom: {
            style: "thin",
            color: "black",
        },
        outline: false,
    },
};
export const _stringContentStyle = {
    font: {
        color: "#000000",
        size: 11,
    },
    alignment: {
        wrapText: true,
    },
    border: {
        left: {
            style: "thin",
            color: "black",
        },
        right: {
            style: "thin",
            color: "black",
        },
        top: {
            style: "thin",
            color: "black",
        },
        bottom: {
            style: "thin",
            color: "black",
        },
        outline: false,
    },
};
export const _numberContentStyle = {
    font: {
        color: "#000000",
        size: 11,
    },
    numberFormat: "#,##0; ($#,##0); 0",
    border: {
        left: {
            style: "thin",
            color: "black",
        },
        right: {
            style: "thin",
            color: "black",
        },
        top: {
            style: "thin",
            color: "black",
        },
        bottom: {
            style: "thin",
            color: "black",
        },
        outline: false,
    },
};

export const seedExpirationTimeInSecs = 3600;

export const AccessRightMethods = {
    PUT: "Create",
    PATCH: "Update",
    POST: "Read",
    GET: "Read",
    DELETE: "Delete",
};


export const userOpts = {
    attributes: {
        include: ["name", "email"],
    },
};


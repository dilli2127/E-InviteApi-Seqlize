// Utility function to safely parse environment variables
const safeParseJson = (value) => {
    try {
        return JSON.parse(value);
    } catch (e) {
        return undefined; // or return a default value if appropriate
    }
};

export const debug = process.env.DEBUG === "WARN" ? true : safeParseJson(process.env.DEBUG);
export const cronEnabled = safeParseJson(process.env.CRON);
export const secure = safeParseJson(process.env.SECURE);
export const prod = safeParseJson(process.env.PROD);
export const environment = String(process.env.ENVIRONMENT || 'default');
export const serverLog = safeParseJson(process.env.SERVER_LOG);
export const httpPort = Number(process.env.HTTP_PORT || 80);
export const httpsPort = Number(process.env.HTTPS_PORT || 443);
export const databaseUrl = String(process.env.DATABASE_URL || 'default_database_url');
export const databaseRawUrl = String(process.env.DATABASE_RAW_URL || 'default_database_raw_url');
export const secretKey = String(process.env.SECRET_KEY || 'default_secret_key');
export const certbotServer = String(process.env.CERTBOT_SERVER || 'default_certbot_server');
export const imageBucketName = process.env.IMAGE_BUCKET_NAME || 'default_image_bucket';
export const mailgunKey = process.env.MAILGUN_KEY || 'default_mailgun_key';
export const mailgunDomain = process.env.MAILGUN_DOMAIN || 'default_mailgun_domain';
export const databaseName = process.env.DATABASE_NAME || 'default_database_name';
export const pdfGenUrl = process.env.PDF_GEN_URL || 'default_pdf_gen_url';
export const dbHost = String(process.env.DB_HOST || 'default_db_host');
export const dbPort = String(process.env.DB_PORT || 'default_db_port');
export const dbUsername = String(process.env.DB_USERNAME || 'default_db_username');
export const dbPassword = String(process.env.DB_PASSWORD || 'default_db_password');
export const dbDumpLocation = String(process.env.DB_DUMP_LOCATION || 'default_db_dump_location');
export const dbBackupDays = String(process.env.DB_BACKUP_DAYS || 'default_db_backup_days');
export const dbDumpCron = String(process.env.DB_DUMP_CRON || 'default_db_dump_cron');
export const smsUrl = process.env.SMS_URL || 'default_sms_url';
export const smsSenderId = process.env.SMS_SENDER_ID || 'default_sms_sender_id';
export const smsUsername = process.env.SMS_USERNAME || 'default_sms_username';
export const smsUniqueId = process.env.SMS_UNIQUE_ID || 'default_sms_unique_id';
export const smsKeyword = process.env.SMS_KEYWORD || 'default_sms_keyword';
export const smsCircleName = process.env.SMS_CIRCLE_NAME || 'default_sms_circle_name';
export const smsCampaignName = process.env.SMS_CAMPAIGN_NAME || 'default_sms_campaign_name';
export const fcmServerKey = process.env.FCM_KEY || 'default_fcm_key';

export const smsDltTmId = process.env.SMS_DLT_TM_ID || 'default_sms_dlt_tm_id';
export const smsDltPeId = process.env.SMS_DLT_PE_ID || 'default_sms_dlt_pe_id';

export const smsProxyUrl = process.env.SMS_PROXY_URL || 'default_sms_proxy_url';
export const smsProxyPort = process.env.SMS_PROXY_PORT || 'default_sms_proxy_port';
export const smsProxyUsername = process.env.SMS_PROXY_USERNAME || 'default_sms_proxy_username';
export const smsProxyPassword = process.env.SMS_PROXY_PASSWORD || 'default_sms_proxy_password';

export const urlShortenerKey = process.env.URL_SHORTENER_KEY || 'default_url_shortener_key';
export const urlShortenerUrl = process.env.URL_SHORTENER_URL || 'default_url_shortener_url';

export const emailUsername = process.env.EMAIL_USERNAME || 'default_email_username';
export const emailPassword = process.env.EMAIL_PASSWORD || 'default_email_password';
export const mailDomain = process.env.MAIL_DOMAIN || 'default_mail_domain';
export const mailPort = Number(process.env.MAIL_PORT || 587);
export const mailUsername = process.env.MAIL_USERNAME || 'default_mail_username';
export const mailPassword = process.env.MAIL_PASSWORD || 'default_mail_password';
export const fromEmail = process.env.FROM_EMAIL || 'default_from_email';

export const smsPassword = process.env.SMS_PASSWORD || 'default_sms_password';
export const smsRoute = process.env.SMS_ROUTE || 'default_sms_route';

export const minioPrefix = process.env.MINIO_PREFIX || 'default_minio_prefix';
export const minioEndpoint = process.env.MINIO_ENDPOINT || 'default_minio_endpoint';
export const minioPort = Number(process.env.MINIO_PORT || 9000);
export const minioUseSslPrefix = safeParseJson(process.env.MINIO_USE_SSL_PREFIX);
export const minioAccessKey = process.env.MINIO_ACCESS_KEY_ID || 'default_minio_access_key';
export const minioSecretKey = process.env.MINIO_SECRET_ACCESS_KEY || 'default_minio_secret_key';
export const minioRegion = process.env.MINIO_REGION || 'default_minio_region';
export const token = process.env.TOKEN ||   'default_token'
export const vultrAccessKey = process.env.VULTR_ACCESS_KEY;
export const vultrSecretKey = process.env.VULTR_SECRET_KEY;
export const vultrRegion = process.env.VULTR_REGION; 
export const vultrBucketName = process.env.VULTR_BUCKET_NAME;
export const vultrS3Endpoint = process.env.VULTR_S3_ENDPOINT; 
export const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
export const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
export const awsRegion = process.env.AWS_REGION;
export const awsBucketName = process.env.AWS_BUCKET_NAME;
export const awsEndpoint = process.env.AWS_S3_ENDPOINT;

 
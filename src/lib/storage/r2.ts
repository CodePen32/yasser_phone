import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Only instantiate in production when all R2 vars are present
function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKey || !secretKey) {
    throw new Error('R2 environment variables are not set (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     accessKey,
      secretAccessKey: secretKey,
    },
  });
}

export async function uploadToR2(
  buffer:   Buffer,
  fileName: string,
  mimeType: string,
  subdir:   string,
): Promise<string> {
  const bucket  = process.env.R2_BUCKET_NAME;
  const baseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!bucket || !baseUrl) {
    throw new Error('R2_BUCKET_NAME or R2_PUBLIC_BASE_URL is not set');
  }

  const key    = `uploads/${subdir}/${fileName}`;
  const client = getR2Client();

  await client.send(new PutObjectCommand({
    Bucket:      bucket,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
    // Public read via R2 custom domain — no ACL needed for R2
  }));

  // Return absolute public URL
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/${key}`;
}

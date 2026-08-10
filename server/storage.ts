// Storage helpers backed by AWS S3.
// If no AWS credentials are configured, storagePut falls back to returning
// a base64 data URL directly — images still work, they just won't persist
// across server restarts.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";

function getS3Config() {
  if (!ENV.awsAccessKeyId || !ENV.awsSecretAccessKey || !ENV.awsBucketName) {
    return null;
  }
  return {
    client: new S3Client({
      region: ENV.awsRegion || "us-east-1",
      credentials: {
        accessKeyId: ENV.awsAccessKeyId,
        secretAccessKey: ENV.awsSecretAccessKey,
      },
    }),
    bucket: ENV.awsBucketName,
    region: ENV.awsRegion || "us-east-1",
  };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const s3 = getS3Config();

  if (!s3) {
    // No S3 configured — return the image inline as a data URL so the app
    // still works end-to-end, just without persistence across restarts.
    const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
    return { key, url: `data:${contentType};base64,${buffer.toString("base64")}` };
  }

  const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  await s3.client.send(
    new PutObjectCommand({
      Bucket: s3.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return { key, url: `https://${s3.bucket}.s3.${s3.region}.amazonaws.com/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const s3 = getS3Config();
  if (!s3) return { key, url: "" };
  return { key, url: `https://${s3.bucket}.s3.${s3.region}.amazonaws.com/${key}` };
}

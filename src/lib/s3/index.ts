import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const isLocalStack = !!process.env.AWS_ENDPOINT_URL;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(isLocalStack && { endpoint: process.env.AWS_ENDPOINT_URL }),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  forcePathStyle: isLocalStack, // Only for LocalStack
});

const bucketName = process.env.AWS_S3_BUCKET || 'manor-ai-documents';

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload a file to S3 with a random suffix for security
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  const randomSuffix = uuidv4().slice(0, 8);
  const extension = filename.split('.').pop() || '';
  const baseName = filename.replace(`.${extension}`, '');
  const key = `documents/${baseName}-${randomSuffix}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Generate URL based on environment
  let url: string;
  if (isLocalStack) {
    url = `${process.env.AWS_ENDPOINT_URL}/${bucketName}/${key}`;
  } else {
    const region = process.env.AWS_REGION || 'us-east-1';
    url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  return { key, url };
}

/**
 * Get a file from S3
 */
export async function getFile(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);
  const stream = response.Body;

  if (!stream) {
    throw new Error('No body in response');
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a public URL for file access
 */
export function getPublicUrl(key: string): string {
  if (isLocalStack) {
    return `${process.env.AWS_ENDPOINT_URL}/${bucketName}/${key}`;
  }
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

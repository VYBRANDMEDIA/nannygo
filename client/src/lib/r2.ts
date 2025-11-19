import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = '124c420412a5efdfdeac04d96e724e30';
const R2_ACCESS_KEY_ID = 'f293420cc2922858907792e0330a9994';
const R2_SECRET_ACCESS_KEY = 'cb5c01e1f3730a17e549086cd22ccd75394f15b73ec933e944c262a1c8e5e2c5';
const R2_BUCKET_NAME = 'nannygo';
const R2_PUBLIC_DOMAIN = 'https://pub-855bdfdd614f41f6b40da5fe56fa6661.r2.dev';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadImageToR2(file: File, folder: string = 'images'): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(command);

    // Return public URL
    return `${R2_PUBLIC_DOMAIN}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload image');
  }
}

export async function uploadMultipleImages(files: File[], folder: string = 'images'): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImageToR2(file, folder));
  return Promise.all(uploadPromises);
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { Request, Response } from "express";
import { nanoid } from "nanoid";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.VITE_R2_ENDPOINT || process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function handlePhotoUpload(req: Request, res: Response) {
  try {
    const { file, userId } = req.body;
    
    if (!file || !userId) {
      return res.status(400).json({ error: "Missing file or userId" });
    }

    // Decode base64
    const base64Data = file.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    const fileName = `profile-photos/${userId}-${nanoid()}.jpg`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.VITE_R2_BUCKET_NAME || "nannygo",
        Key: fileName,
        Body: buffer,
        ContentType: "image/jpeg",
      })
    );

    const publicUrl = `${process.env.VITE_R2_PUBLIC_URL}/${fileName}`;

    res.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
}

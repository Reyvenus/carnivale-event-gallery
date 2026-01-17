import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./config.js";


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, originalContentType, thumbnailContentType } = req.body;
    console.log("body", req.body);

    if (!filename || !originalContentType || !thumbnailContentType) {
      return res.status(400).json({ error: 'Missing filename, originalContentType, or thumbnailContentType' });
    };

    const timestamp = Date.now();
    const safeFilename = filename.replace(/\s+/g, '_');
    console.log("safeFilename", safeFilename);
    const uniqueFilename = `${timestamp}-${safeFilename}`;

    // 1. Preparo URL para la foto original
    const originalKey = `uploads/originals/${uniqueFilename}`;
    const originalCommand = new PutObjectCommand({
      Bucket: process.env.VITE_AWS_BUCKET_NAME,
      Key: originalKey,
      ContentType: originalContentType,
    });
    const originalUrl = await getSignedUrl(s3Client, originalCommand, { expiresIn: 600 }); // 10 mins to start upload

    // 2. Preparo URL para la foto thumbnail
    const thumbnailKey = `uploads/thumbnails/${uniqueFilename}`;
    const thumbnailCommand = new PutObjectCommand({
      Bucket: process.env.VITE_AWS_BUCKET_NAME,
      Key: thumbnailKey,
      ContentType: thumbnailContentType,
    });
    const thumbnailUrl = await getSignedUrl(s3Client, thumbnailCommand, { expiresIn: 600 });
    console.log("originalUrl", originalUrl);
    console.log("thumbnailUrl", thumbnailUrl);

    res.status(200).json({
      original: { url: originalUrl, key: originalKey },
      thumbnail: { url: thumbnailUrl, key: thumbnailKey }
    });

  } catch (error) {
    console.error("Error in api/sign-upload:", error);
    res.status(500).json({ error: 'Failed to generate upload URLs' });
  }
}

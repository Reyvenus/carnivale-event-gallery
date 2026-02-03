import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./config.js";


export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { key } = req.body;
    console.log("Deleting photo with key:", key);

    if (!key) {
      return res.status(400).json({ error: 'Missing key' });
    }

    // 1. Borrar Thumbnail
    const deleteThumbnailCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteThumbnailCommand);

    console.log("Successfully deleted thumbnail:", key);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error in api/delete-photo:", error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
}

import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, s3Command } from "./config.js";


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'uploads/',
    });

    const response = await s3Client.send(command);
    console.log("response", response);

    if (!response.Contents) {
      return res.status(200).json([]);
    }

    // Filter: ignoramos carpetas y ponemo focus en identificar thumbnails/originals
    const processedItems = response.Contents.filter(item => {
      if (item.Key.endsWith('/')) return false;

      const isThumbnail = item.Key.includes('/thumbnails/');
      return isThumbnail;
    });

    console.log("processedItems", processedItems);
    // Ordenamos por última modificación desc
    const sortedObjects = processedItems.sort((a, b) => b.LastModified - a.LastModified);

    // Generamos URLs firmadas en paralelo
    const photosWithUrls = await Promise.all(
      sortedObjects.map(async (item) => {
        const isThumbnail = item.Key.includes('/thumbnails/');
        const originalKey = isThumbnail
          ? item.Key.replace('/thumbnails/', '/originals/')
          : null;

        // Comando for "Thumbnail/Legacy (Grid view)
        const getThumbnailCommand = s3Command(item.Key);
        // Command for "Original
        const getOriginalCommand = s3Command(originalKey);

        const thumbnailUrlPromise = getSignedUrl(
          s3Client,
          getThumbnailCommand,
          { expiresIn: 3600 }
        );

        const originalUrlPromise = isThumbnail
          ? getSignedUrl(
            s3Client,
            getOriginalCommand,
            { expiresIn: 3600 }
          )
          : Promise.resolve(null);

        const [thumbnailUrl, originalUrl] = await Promise.all([
          thumbnailUrlPromise,
          originalUrlPromise
        ]);

        return {
          key: item.Key,
          thumbnailUrl,
          originalUrl: originalUrl || thumbnailUrl,
          lastModified: item.LastModified
        };
      })
    );

    console.log("photosWithUrls", photosWithUrls);

    res.status(200).json(photosWithUrls);

  } catch (error) {
    console.error("Error in api/gallery:", error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
}

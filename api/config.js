import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";


export const s3Client = new S3Client({
  region: process.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});


export const s3Command = (key) => {
  return new GetObjectCommand({
    Bucket: process.env.VITE_AWS_BUCKET_NAME,
    Key: key,
  });
};

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
export const s3Client = new S3Client({
  region: process.env.AWS_REGION! || "us-west-2",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = "sailing-club";

// export async function uploadToS3(file: File, path: string): Promise<string> {
//   console.log(`[S3] Starting upload for file: ${file.name} to path: ${path}`)

//   const command = new PutObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: path,
//     Body: await file.arrayBuffer(),
//     ContentType: file.type,
//   })

//   try {
//     await s3Client.send(command)
//     console.log(`[S3] Upload successful for file: ${file.name}`)

//     const objectUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`
//     console.log(`[S3] Generated object URL: ${objectUrl}`)

//     return objectUrl
//   } catch (error) {
//     console.error(`[S3] Error uploading file ${file.name}:`, error)
//     throw error
//   }
// }

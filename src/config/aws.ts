import {
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

const aws_access_key_id = process.env.AWS_ACCESS_KEY_ID;
const aws_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;
const aws_region = process.env.AWS_REGION;
const s3_bucket_name = process.env.S3_BUCKET_NAME;
const aws_endpoint = process.env.AWS_ENDPOINT;

export const s3 = new S3Client({
  credentials: {
    accessKeyId: aws_access_key_id,
    secretAccessKey: aws_secret_access_key,
  },
  maxAttempts: 10,
  region: aws_region,
  endpoint: aws_endpoint,
});

export const uploadFile = async (
  fileBuffer: any,
  key: string,
  mimetype: any
) => {
  const uploadParams = {
    Bucket: s3_bucket_name,
    Body: fileBuffer,
    Key: key,
    ContentType: mimetype,
  };

  const temp = await s3.send(new PutObjectCommand(uploadParams));

  return generateFileURL(key, temp.VersionId);
};

export const deleteFile = (data: { key: string; version: string }) => {
  const deleteParams = {
    Bucket: s3_bucket_name,
    Key: data.key,
    VersionId: data.version,
  };

  return s3.send(new DeleteObjectCommand(deleteParams));
};

export const getFile = (key: string) => {
  const getParams = {
    Bucket: s3_bucket_name,
    Key: key,
  };

  return s3.send(new GetObjectCommand(getParams));
};

export const generateFileName = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("hex");
};

// export const generateFileURL = (key: string, version: string) => {
//   return `https://${s3_bucket_name}.s3.${aws_region}.amazonaws.com/${key}?versionId=${version}`;
// };

export const generateFileURL = (key: string, version: string) => {
  return `https://${s3_bucket_name}.${aws_region}.your-objectstorage.com/${key}`;
};

export const handleUpload = async (
  files: Express.Multer.File[],
  pathname: string = null
) => {
  const uploadPromises = files.map((file) => {
    const extension = path.extname(file.originalname);
    let key = generateFileName();

    if (pathname) {
      key = `${pathname}/${generateFileName() + extension}`;
    }

    return uploadFile(file.buffer, key, file.mimetype);
  });

  const fileUrls = await Promise.all(uploadPromises);

  return fileUrls;
};
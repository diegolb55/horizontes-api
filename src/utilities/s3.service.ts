import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { config } from 'dotenv';
import { Express } from 'express';
const sharp = require('sharp');

config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

@Injectable()
export class S3Service {
    private readonly bucketName: string;

    constructor() {
        const bucketName = process.env.AWS_S3_BUCKET_NAME;

        if (!bucketName) {
            throw new Error('❌ Missing required env var: AWS_S3_BUCKET_NAME');
        }

        this.bucketName = bucketName;
    }

    async uploadFile(file: Express.Multer.File, folder = '') {
        const folderPath = folder ? `${folder}/` : '';

        // ✅ Compress & Convert the Image
        const compressedBuffer = await sharp(file.buffer)
            .resize({ width: 800 }) // Adjust width as needed
            .webp({ quality: 80 })  // Convert to WebP with quality 80 (adjustable)
            .toBuffer();

        const newFileName = `${Date.now()}_${file.originalname.split('.')[0]}.webp`;

        const uploadParams: AWS.S3.PutObjectRequest = {
            Bucket: this.bucketName,
            Key: `${folderPath}${newFileName}`,
            Body: compressedBuffer,
            ContentType: 'image/webp',
            // ACL: 'public-read'
        };

        return s3.upload(uploadParams).promise();
    }

    async deleteFolder(prefix: string) {
        try {
            const listParams: AWS.S3.ListObjectsV2Request = {
                Bucket: this.bucketName,
                Prefix: `${prefix}/`,
            };

            const listedObjects = await s3.listObjectsV2(listParams).promise();

            if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

            const deleteParams: AWS.S3.DeleteObjectsRequest = {
                Bucket: this.bucketName,
                Delete: {
                    Objects: listedObjects.Contents.map((item) => ({ Key: item.Key! })), // `Key` is always set in S3
                },
            };

            await s3.deleteObjects(deleteParams).promise();
        } catch (error: any) {
            throw new Error(`❌ Failed to delete folder "${prefix}": ${error.message}`);
        }
    }
}

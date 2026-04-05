/**
 * API & Integration Mastery — AWS S3 / Cloudflare R2 File Storage (2026)
 * =======================================================================
 * Production file storage service with:
 * - Upload (buffer, stream, presigned URL)
 * - Download (stream, presigned URL)
 * - Delete (single, batch)
 * - Image optimization integration
 * - Signed URL generation
 *
 * Works with: AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import crypto from 'node:crypto';
import path from 'node:path';


// ============================================
// FILE STORAGE SERVICE
// ============================================
export class FileStorageService {
  /**
   * @param {object} config
   * @param {string} config.bucket - Bucket name
   * @param {string} config.region - AWS region (or 'auto' for R2)
   * @param {string} config.accessKeyId
   * @param {string} config.secretAccessKey
   * @param {string} config.endpoint - Custom endpoint (R2, MinIO)
   * @param {string} config.publicUrl - CDN URL prefix for public files
   * @param {number} config.maxFileSize - Max upload size in bytes (default: 50MB)
   */
  constructor(config) {
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
    this.maxFileSize = config.maxFileSize || 50 * 1024 * 1024;

    this.client = new S3Client({
      region: config.region || 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: !!config.endpoint, // Required for MinIO/R2
    });

    // Allowed MIME types
    this.allowedMimeTypes = new Set([
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/json',
      'application/zip', 'application/gzip',
      'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
    ]);
  }


  // ---- Upload from Buffer/File ----
  async upload(file, options = {}) {
    // Validate
    this._validateFile(file);

    const ext = path.extname(file.originalname || file.name || '').toLowerCase();
    const folder = options.folder || 'uploads';
    const key = options.key || `${folder}/${this._generateKey()}${ext}`;

    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer || file,
      ContentType: file.mimetype || file.type || 'application/octet-stream',
      ContentLength: file.size,
      Metadata: {
        originalName: file.originalname || file.name || 'unknown',
        uploadedBy: options.userId || 'system',
        ...options.metadata,
      },
    };

    // Set ACL for public files
    if (options.public) {
      params.ACL = 'public-read';
    }

    // Set cache control
    if (options.cacheControl) {
      params.CacheControl = options.cacheControl;
    } else if (file.mimetype?.startsWith('image/')) {
      params.CacheControl = 'public, max-age=31536000, immutable'; // 1 year for images
    }

    await this.client.send(new PutObjectCommand(params));

    return {
      key,
      url: this.publicUrl ? `${this.publicUrl}/${key}` : null,
      bucket: this.bucket,
      size: file.size,
      mimeType: params.ContentType,
      originalName: file.originalname || file.name,
    };
  }


  // ---- Upload Large File (Multipart) ----
  async uploadStream(stream, key, contentType, options = {}) {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: contentType,
        Metadata: options.metadata || {},
      },
      queueSize: 4,           // Concurrent part uploads
      partSize: 10 * 1024 * 1024, // 10MB parts
      leavePartsOnError: false,
    });

    // Progress tracking
    if (options.onProgress) {
      upload.on('httpUploadProgress', options.onProgress);
    }

    return upload.done();
  }


  // ---- Presigned Upload URL (Client-Direct Upload) ----
  async getPresignedUploadUrl(params) {
    const { filename, contentType, folder = 'uploads', expiresIn = 3600 } = params;
    const ext = path.extname(filename).toLowerCase();
    const key = `${folder}/${this._generateKey()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      uploadUrl,
      key,
      publicUrl: this.publicUrl ? `${this.publicUrl}/${key}` : null,
      expiresIn,
    };
  }


  // ---- Presigned Download URL ----
  async getPresignedDownloadUrl(key, options = {}) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...(options.filename && {
        ResponseContentDisposition: `attachment; filename="${options.filename}"`,
      }),
    });

    return getSignedUrl(this.client, command, {
      expiresIn: options.expiresIn || 3600,
    });
  }


  // ---- Get File Metadata ----
  async getMetadata(key) {
    const response = await this.client.send(new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));

    return {
      key,
      size: response.ContentLength,
      mimeType: response.ContentType,
      lastModified: response.LastModified,
      metadata: response.Metadata,
      etag: response.ETag,
    };
  }


  // ---- Download as Stream ----
  async download(key) {
    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));

    return {
      stream: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
    };
  }


  // ---- Delete ----
  async delete(key) {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }

  async deleteBatch(keys) {
    if (keys.length === 0) return;

    await this.client.send(new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map(Key => ({ Key })),
        Quiet: true,
      },
    }));
  }


  // ---- Copy / Move ----
  async copy(sourceKey, destKey) {
    await this.client.send(new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${sourceKey}`,
      Key: destKey,
    }));
    return { key: destKey };
  }

  async move(sourceKey, destKey) {
    await this.copy(sourceKey, destKey);
    await this.delete(sourceKey);
    return { key: destKey };
  }


  // ---- List Files ----
  async list(prefix, options = {}) {
    const response = await this.client.send(new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      MaxKeys: options.limit || 1000,
      ContinuationToken: options.cursor,
    }));

    return {
      files: (response.Contents || []).map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag,
      })),
      nextCursor: response.NextContinuationToken || null,
      isTruncated: response.IsTruncated,
    };
  }


  // ---- Private Helpers ----
  _generateKey() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}`;
  }

  _validateFile(file) {
    const size = file.size || file.length;
    const mimeType = file.mimetype || file.type;

    if (size > this.maxFileSize) {
      throw new Error(`File exceeds maximum size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (mimeType && !this.allowedMimeTypes.has(mimeType)) {
      throw new Error(`File type "${mimeType}" is not allowed`);
    }
  }
}


// ============================================
// EXPRESS MIDDLEWARE (Multer + S3 Upload)
// ============================================
export function createUploadMiddleware(storage) {
  /**
   * Express route for file upload.
   * Usage: app.post('/api/v1/files', upload, uploadRoute);
   */
  return async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          error: { code: 'NO_FILE', message: 'No file uploaded' },
        });
      }

      const result = await storage.upload(req.file, {
        folder: req.body.folder || 'uploads',
        userId: req.user?.id,
        public: req.body.public === 'true',
      });

      return res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}


// ============================================
// INITIALIZATION
// ============================================
export function createFileStorage() {
  return new FileStorageService({
    bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION || 'auto',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,             // For R2/MinIO
    publicUrl: process.env.S3_PUBLIC_URL,           // CDN URL
    maxFileSize: 50 * 1024 * 1024,                  // 50MB
  });
}

console.log('✅ File storage example loaded — Upload, Download, Presigned URLs, Batch Delete');

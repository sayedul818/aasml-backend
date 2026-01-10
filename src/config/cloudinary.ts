import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configurations for different resource types
export const memberImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aasml/members',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  } as any
});

export const researchImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aasml/research/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  } as any
});

export const researchDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aasml/research/documents',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw'
  } as any
});

export const projectStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aasml/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'],
    // Let Cloudinary determine the correct resource type for images and documents
    resource_type: 'auto'
  } as any
});

export const publicationStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aasml/publications',
    allowed_formats: ['pdf'],
    resource_type: 'raw'
  } as any
});

export const eventStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aasml/events',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf']
  } as any
});

export const applicationStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aasml/applications',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw'
  } as any
});

export default cloudinary;

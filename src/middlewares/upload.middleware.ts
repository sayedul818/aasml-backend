import multer from 'multer';
import {
  memberImageStorage,
  researchImageStorage,
  researchDocumentStorage,
  projectStorage,
  publicationStorage,
  eventStorage,
  applicationStorage
} from '../config/cloudinary';
import ApiError from '../utils/ApiError';

// Default file size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Publication PDFs have Cloudinary limits; keep under 9MB to avoid provider rejection
const PUBLICATION_MAX_FILE_SIZE = 9 * 1024 * 1024;

// File filter for images
const imageFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPG, PNG, and WEBP images are allowed.'));
  }
};

// File filter for documents
const documentFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only PDF and DOCX files are allowed.'));
  }
};

// File filter for mixed (images and documents)
const mixedFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only images (JPG, PNG, WEBP) and documents (PDF, DOCX) are allowed.'));
  }
};

// Member image upload
export const uploadMemberImage = multer({
  storage: memberImageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFileFilter
}).single('image');

// Research image upload
export const uploadResearchImage = multer({
  storage: researchImageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFileFilter
}).single('image');

// Research document upload
export const uploadResearchDocument = multer({
  storage: researchDocumentStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: documentFileFilter
}).single('document');

// Project files upload (multiple images and documents)
export const uploadProjectFiles = multer({
  storage: projectStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: mixedFileFilter
}).fields([
  // Primary field names used by the app
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 },
  // Backward-compatible aliases in case the frontend sends these
  { name: 'image', maxCount: 1 },
  { name: 'report', maxCount: 1 }
]);

// Publication PDF upload
export const uploadPublicationPDF = multer({
  storage: publicationStorage,
  limits: { fileSize: PUBLICATION_MAX_FILE_SIZE },
  fileFilter: documentFileFilter
}).single('pdf');

// Event files upload
export const uploadEventFiles = multer({
  storage: eventStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: mixedFileFilter
}).fields([
  { name: 'poster', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

// Application files upload (CV and cover letter)
export const uploadApplicationFiles = multer({
  storage: applicationStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: documentFileFilter
}).fields([
  { name: 'cv', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 }
]);

// Generic single file upload
export const uploadSingleFile = (fieldName: string, storage: any) => {
  return multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: mixedFileFilter
  }).single(fieldName);
};

// Generic multiple files upload
export const uploadMultipleFiles = (fieldName: string, maxCount: number, storage: any) => {
  return multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: mixedFileFilter
  }).array(fieldName, maxCount);
};

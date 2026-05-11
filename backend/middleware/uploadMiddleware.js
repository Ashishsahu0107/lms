import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    // Create subdirectories based on file type
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadsDir, 'avatars');
    } else if (file.fieldname === 'thumbnail') {
      uploadPath = path.join(uploadsDir, 'thumbnails');
    } else if (file.fieldname === 'video') {
      uploadPath = path.join(uploadsDir, 'videos');
    } else if (file.fieldname === 'pdf') {
      uploadPath = path.join(uploadsDir, 'pdfs');
    } else {
      uploadPath = path.join(uploadsDir, 'documents');
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    avatar: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    thumbnail: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
    pdf: ['application/pdf'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'image/jpeg',
      'image/png'
    ]
  };

  const allowedMimes = allowedTypes[file.fieldname] || allowedTypes.document;
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed for ${file.fieldname}`), false);
  }
};

// Initialize upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Max 5 files at once
  }
});

// Single file upload
const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Mixed file upload for course creation
const uploadCourseFiles = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'videos', maxCount: 10 },
  { name: 'pdfs', maxCount: 5 },
  { name: 'documents', maxCount: 10 }
]);

// Assignment files upload
const uploadAssignmentFiles = upload.fields([
  { name: 'attachments', maxCount: 5 }
]);

// Submission files upload
const uploadSubmissionFiles = upload.fields([
  { name: 'file', maxCount: 1 }
]);

export {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadCourseFiles,
  uploadAssignmentFiles,
  uploadSubmissionFiles
};

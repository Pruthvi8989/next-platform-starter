const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Upload bank statement
router.post('/bank-statement', auth, upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date()
    };

    // TODO: Implement bank statement processing logic
    // This would involve:
    // 1. Parsing the uploaded file (PDF/image)
    // 2. Extracting transaction data using OCR or PDF parsing
    // 3. Automatically creating transactions in the database
    // 4. Matching transactions with existing accounts

    res.json({
      message: 'Bank statement uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Error uploading bank statement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload bill photo
router.post('/bill-photo', auth, upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date()
    };

    // TODO: Implement bill photo processing logic
    // This would involve:
    // 1. Using OCR to extract bill information
    // 2. Parsing vendor name, amount, due date
    // 3. Automatically creating a bill entry
    // 4. Suggesting category based on vendor

    res.json({
      message: 'Bill photo uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Error uploading bill photo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload transaction attachment
router.post('/transaction-attachment', auth, upload.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date()
    };

    res.json({
      message: 'Attachment uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get uploaded files
router.get('/files', auth, async (req, res) => {
  try {
    const uploadPath = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadPath)) {
      return res.json([]);
    }

    const files = fs.readdirSync(uploadPath).map(filename => {
      const filePath = path.join(uploadPath, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        uploadedAt: stats.birthtime,
        path: `/uploads/${filename}`
      };
    });

    res.json(files);

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete uploaded file
router.delete('/files/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
  }
  
  if (error.message === 'Only images and PDF files are allowed') {
    return res.status(400).json({ message: error.message });
  }
  
  res.status(500).json({ message: 'Upload error' });
});

module.exports = router;
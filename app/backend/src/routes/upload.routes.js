import express from 'express';
import { upload } from '../utils/upload.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// Upload Single File wrapper
router.post('/', verifyToken, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Upload failed: ${err.message}`));
    }

    if (!req.file) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded'));
    }

    const path = req.file.path;
    const url = path.startsWith('http')
      ? path
      : `${req.protocol}://${req.get('host')}${path.replace(/^public/, '')}`;

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        url: url,
        filename: req.file.filename
      }
    });
  });
});

// Upload Multiple Files
router.post('/multiple', verifyToken, upload.array('images', 5), (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'No files uploaded'));
  }

  const urls = req.files.map(file => {
    const path = file.path;
    return path.startsWith('http')
      ? path
      : `${req.protocol}://${req.get('host')}${path.replace(/^public/, '')}`;
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: { urls }
  });
});

export default router;

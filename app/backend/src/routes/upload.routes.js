import express from 'express';
import { upload } from '../utils/upload.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// Upload Single File
router.post('/', verifyToken, upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded'));
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      url: req.file.path,
      filename: req.file.filename
    }
  });
});

// Upload Multiple Files
router.post('/multiple', verifyToken, upload.array('images', 5), (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'No files uploaded'));
  }

  const urls = req.files.map(file => file.path);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: { urls }
  });
});

export default router;

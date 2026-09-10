import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// @route   POST /api/upload
// @desc    Direct Image Upload (Base64 or File data)
router.post('/', async (req, res, next) => {
  try {
    const { image, filename } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided.'
      });
    }

    // If it's a base64 string
    if (image.startsWith('data:image/')) {
      const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const uniqueName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
        const filePath = path.join(uploadsDir, uniqueName);

        fs.writeFileSync(filePath, base64Data, 'base64');
        const fileUrl = `http://localhost:5000/uploads/${uniqueName}`;

        return res.json({
          success: true,
          message: 'Image uploaded successfully!',
          url: fileUrl,
          imageUrl: fileUrl
        });
      }
    }

    // Return the image directly if already formatted
    res.json({
      success: true,
      message: 'Image processed successfully!',
      url: image,
      imageUrl: image
    });
  } catch (error) {
    next(error);
  }
});

export default router;

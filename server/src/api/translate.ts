import express, { Request, Response } from 'express';
import { translateToUrdu } from '../skills/urdu-translator';

const router = express.Router();

/**
 * POST /api/v1/translate/urdu
 * Translates English text to Urdu
 */
router.post('/urdu', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Text parameter is required and must be a string',
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Text must be less than 50,000 characters',
      });
    }

    const result = await translateToUrdu(text);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to translate text',
    });
  }
});

/**
 * GET /api/v1/translate/languages
 * Returns list of supported languages
 */
router.get('/languages', (req: Request, res: Response) => {
  res.json({
    success: true,
    languages: [
      {
        code: 'ur',
        name: 'Urdu',
        nativeName: 'اردو',
        supported: true,
      },
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        supported: true,
      },
    ],
  });
});

export default router;

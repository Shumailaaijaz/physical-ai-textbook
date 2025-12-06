import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chapterId } = req.query;

    if (!chapterId || typeof chapterId !== 'string') {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }

    // Get translation from database
    const { data: translation, error: translationError } = await supabase
      .from('translation_content')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('language_code', 'ur')
      .single();

    if (translationError || !translation) {
      return res.status(404).json({
        error: 'Translation not found',
        message: `No Urdu translation available for chapter ${chapterId} yet`
      });
    }

    // Set caching headers
    const lastModified = new Date(translation.last_updated).toUTCString();
    const etag = `"${translation.translation_id}-${translation.last_updated}"`;

    res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
    res.setHeader('Last-Modified', lastModified);
    res.setHeader('ETag', etag);

    // Check if client has cached version
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag === etag) {
      return res.status(304).end(); // Not Modified
    }

    return res.status(200).json({
      translation_id: translation.translation_id,
      chapter_id: translation.chapter_id,
      language_code: translation.language_code,
      mdx_content: translation.mdx_content,
      completeness_percentage: translation.completeness_percentage,
      last_updated: translation.last_updated,
      translator_notes: translation.translator_notes,
    });
  } catch (error: any) {
    console.error('Translation API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

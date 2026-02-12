import express from 'express';
import ResearchFolder from '../models/ResearchFolder.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Delete a photo from a research folder
router.delete('/folders/:folderId/photos/:photoId', async (req, res) => {
  try {
    const { folderId, photoId } = req.params;
    const folder = await ResearchFolder.findById(folderId);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    const photo = folder.photos.id(photoId) || folder.photos.find(p => p._id?.toString() === photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Optionally delete the file from disk if stored locally
    if (photo.url && photo.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'uploads', photo.url.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove photo from folder
    folder.photos = folder.photos.filter(p => p._id?.toString() !== photoId);
    await folder.save();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;

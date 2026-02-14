import express from 'express';
import Director from '../models/Director.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET all directors (public)
router.get('/', async (req, res) => {
  try {
    const directors = await Director.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    res.json(directors);
  } catch (error) {
    console.error('Error fetching directors:', error);
    res.status(500).json({ error: 'Failed to fetch directors' });
  }
});

// GET single director by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const director = await Director.findById(req.params.id);
    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }
    res.json(director);
  } catch (error) {
    console.error('Error fetching director:', error);
    res.status(500).json({ error: 'Failed to fetch director' });
  }
});

// POST create new director (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, title, image, imagePosition, slug, order } = req.body;

    // Validate required fields
    if (!name?.en || !name?.ta || !title?.en || !title?.ta || !image) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const director = new Director({
      name,
      title,
      image,
      imagePosition: imagePosition || 'center top',
      slug,
      order: order || 0
    });

    await director.save();
    res.status(201).json(director);
  } catch (error) {
    console.error('Error creating director:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create director' });
  }
});

// PUT update director (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, title, image, imagePosition, slug, order, isActive } = req.body;

    const director = await Director.findById(req.params.id);
    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }

    // Update fields if provided
    if (name) director.name = name;
    if (title) director.title = title;
    if (image) director.image = image;
    if (imagePosition !== undefined) director.imagePosition = imagePosition;
    if (slug !== undefined) director.slug = slug;
    if (order !== undefined) director.order = order;
    if (isActive !== undefined) director.isActive = isActive;

    await director.save();
    res.json(director);
  } catch (error) {
    console.error('Error updating director:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update director' });
  }
});

// DELETE director (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const director = await Director.findByIdAndDelete(req.params.id);
    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }
    res.json({ message: 'Director deleted successfully' });
  } catch (error) {
    console.error('Error deleting director:', error);
    res.status(500).json({ error: 'Failed to delete director' });
  }
});

// PUT reorder directors (admin only)
router.put('/reorder/all', isAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array' });
    }

    // Update order for each director
    const updatePromises = orderedIds.map((id, index) =>
      Director.findByIdAndUpdate(id, { order: index })
    );

    await Promise.all(updatePromises);
    
    const directors = await Director.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    
    res.json(directors);
  } catch (error) {
    console.error('Error reordering directors:', error);
    res.status(500).json({ error: 'Failed to reorder directors' });
  }
});

export default router;

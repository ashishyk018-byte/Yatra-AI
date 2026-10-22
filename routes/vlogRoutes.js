
const express = require('express');
const Vlog = require('../models/Vlog');

const router = express.Router();

// GET /api/vlogs - Fetch all saved vlogs
router.get('/', async (req, res) => {
  try {
    const vlogs = await Vlog.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vlogs.length,
      data: vlogs
    });
  } catch (error) {
    console.error('Fetch vlogs error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch vlogs'
    });
  }
});

// POST /api/vlogs - Create a new vlog
router.post('/', async (req, res) => {
  try {
    const { title, place, url } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof place !== 'string' ||
      !place.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Title and place are required'
      });
    }

    if (url !== undefined && typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'URL must be a string'
      });
    }

    const vlog = await Vlog.create({
      title: title.trim(),
      place: place.trim(),
      url: typeof url === 'string' ? url.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Vlog created successfully',
      data: vlog
    });
  } catch (error) {
    console.error('Create vlog error:', error.message);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid vlog data'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Unable to create vlog'
    });
  }
});


// POST route ke baad aur module.exports se pehle
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vlog ID'
      });
    }

    const vlog = await Vlog.findByIdAndDelete(id);

    if (!vlog) {
      return res.status(404).json({
        success: false,
        message: 'Vlog not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vlog deleted successfully',
      data: vlog
    });
  } catch (error) {
    console.error('Delete vlog error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to delete vlog'
    });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, place, url } = req.body;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vlog ID'
      });
    }

    if (
      typeof title !== 'string' || !title.trim() ||
      typeof place !== 'string' || !place.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Title and place are required'
      });
    }

    if (url !== undefined && typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'URL must be a string'
      });
    }

    const vlog = await Vlog.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        place: place.trim(),
        url: typeof url === 'string' ? url.trim() : ''
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!vlog) {
      return res.status(404).json({
        success: false,
        message: 'Vlog not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vlog updated successfully',
      data: vlog
    });
  } catch (error) {
    console.error('Update vlog error:', error.message);

    res.status(error.name === 'ValidationError' ? 400 : 500).json({
      success: false,
      message: error.name === 'ValidationError'
        ? 'Invalid vlog data'
        : 'Unable to update vlog'
    });
  }
});


module.exports = router;

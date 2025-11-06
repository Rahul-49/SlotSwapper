import express from 'express';
import { Event, EVENT_STATUS } from '../models/Event.js';

const router = express.Router();

// Create event
router.post('/', async (req, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;
    const event = await Event.create({
      title,
      startTime,
      endTime,
      status: status || EVENT_STATUS.BUSY,
      userId: req.user.id,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update my event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const event = await Event.findOneAndUpdate({ _id: id, userId: req.user.id }, update, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete my event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Event.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

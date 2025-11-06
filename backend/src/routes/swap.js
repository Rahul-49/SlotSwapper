import express from 'express';
import mongoose from 'mongoose';
import { Event, EVENT_STATUS } from '../models/Event.js';
import { SwapRequest, SWAP_STATUS } from '../models/SwapRequest.js';

const router = express.Router();

// GET /api/swappable-slots - other users' swappable slots
router.get('/swappable-slots', async (req, res) => {
  try {
    const slots = await Event.find({ userId: { $ne: req.user.id }, status: EVENT_STATUS.SWAPPABLE })
      .sort({ startTime: 1 })
      .lean();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/swap-request - create swap request
router.post('/swap-request', async (req, res) => {
  try {
    const { requesterEventId, requestedEventId } = req.body; // my event, their event
    if (!mongoose.isValidObjectId(requesterEventId) || !mongoose.isValidObjectId(requestedEventId)) {
      return res.status(400).json({ message: 'Invalid event ids' });
    }

    const myEvent = await Event.findOne({ _id: requesterEventId, userId: req.user.id });
    const theirEvent = await Event.findById(requestedEventId);
    if (!myEvent || !theirEvent) return res.status(404).json({ message: 'Events not found' });
    if (theirEvent.userId.toString() === req.user.id) return res.status(400).json({ message: 'Cannot request your own event' });

    const swap = await SwapRequest.create({
      requesterUserId: req.user.id,
      requestedUserId: theirEvent.userId,
      requesterEventId: myEvent._id,
      requestedEventId: theirEvent._id,
      status: SWAP_STATUS.PENDING,
    });
    res.status(201).json(swap);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/swap-response/:id - accept/reject
router.post('/swap-response/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' | 'reject'

    const swap = await SwapRequest.findById(id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });

    // Only requested user can respond
    if (swap.requestedUserId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    if (swap.status !== SWAP_STATUS.PENDING) {
      return res.status(400).json({ message: 'Swap already processed' });
    }

    if (action === 'reject') {
      swap.status = SWAP_STATUS.REJECTED;
      await swap.save();
      return res.json(swap);
    }

    if (action === 'accept') {
      // Fetch both events
      const reqEvent = await Event.findById(swap.requesterEventId);
      const resEvent = await Event.findById(swap.requestedEventId);
      if (!reqEvent || !resEvent) return res.status(404).json({ message: 'Events not found' });

      // Exchange userId and set both BUSY
      const tmpUser = reqEvent.userId;
      reqEvent.userId = resEvent.userId;
      resEvent.userId = tmpUser;
      reqEvent.status = EVENT_STATUS.BUSY;
      resEvent.status = EVENT_STATUS.BUSY;

      await Promise.all([reqEvent.save(), resEvent.save()]);

      swap.status = SWAP_STATUS.ACCEPTED;
      await swap.save();

      // Reject all other pending swaps involving these events to avoid conflicts
      await SwapRequest.updateMany(
        {
          _id: { $ne: swap._id },
          status: SWAP_STATUS.PENDING,
          $or: [
            { requesterEventId: { $in: [reqEvent._id, resEvent._id] } },
            { requestedEventId: { $in: [reqEvent._id, resEvent._id] } },
          ],
        },
        { $set: { status: SWAP_STATUS.REJECTED } }
      );

      return res.json({ swap, reqEvent, resEvent });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Requests for current user (incoming/outgoing)
router.get('/swap-requests', async (req, res) => {
  try {
    const me = req.user.id;
    const basePopulate = [
      { path: 'requesterEventId', select: 'title startTime endTime' },
      { path: 'requestedEventId', select: 'title startTime endTime' },
    ];
    const [incoming, outgoing] = await Promise.all([
      SwapRequest.find({ requestedUserId: me })
        .sort({ createdAt: -1 })
        .populate(basePopulate)
        .lean(),
      SwapRequest.find({ requesterUserId: me })
        .sort({ createdAt: -1 })
        .populate(basePopulate)
        .lean(),
    ]);
    res.json({ incoming, outgoing });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

import mongoose from 'mongoose';

export const SWAP_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

const swapRequestSchema = new mongoose.Schema(
  {
    requesterUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requesterEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    requestedEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: Object.values(SWAP_STATUS), default: SWAP_STATUS.PENDING },
  },
  { timestamps: true }
);

export const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

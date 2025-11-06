import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import { auth } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import swapRoutes from './routes/swap.js';

// Ensure .env is loaded from backend root even if started from backend/src
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.send('SlotSwapper API running'));

app.use('/api/auth', authRoutes);
app.use('/api/events', auth, eventsRoutes);
app.use('/api', auth, swapRoutes);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});

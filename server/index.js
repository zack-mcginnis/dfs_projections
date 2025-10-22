import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import oddsRoutes from './routes/odds.js';
import pricesRoutes from './routes/prices.js';
import projectionsRoutes from './routes/projections.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/odds', oddsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/projections', projectionsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'DFS Projections API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


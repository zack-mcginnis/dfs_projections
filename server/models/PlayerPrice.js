import mongoose from 'mongoose';

const playerPriceSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  team: String,
  position: String,
  opponent: String,
  platform: {
    type: String,
    enum: ['Fanduel', 'Yahoo']
  },
  salary: Number,
  game: String,
  fetchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('PlayerPrice', playerPriceSchema);


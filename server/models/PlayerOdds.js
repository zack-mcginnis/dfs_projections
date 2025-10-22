import mongoose from 'mongoose';

const playerOddsSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true
  },
  team: String,
  game: String,
  opponent: String,
  markets: [{
    marketType: String, // e.g., 'player_rush_yds', 'player_receptions', etc.
    line: Number,
    overOdds: Number,
    underOdds: Number,
    bookmaker: String
  }],
  fetchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('PlayerOdds', playerOddsSchema);


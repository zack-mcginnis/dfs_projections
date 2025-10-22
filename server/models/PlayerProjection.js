import mongoose from 'mongoose';

const playerProjectionSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true
  },
  team: String,
  position: String,
  opponent: String,
  game: String,
  // DFS pricing info
  fanduelSalary: Number,
  yahooSalary: Number,
  // Projection data
  projectedPoints: Number,
  projectedStats: {
    rushAttempts: Number,
    rushYards: Number,
    rushTDs: Number,
    receptions: Number,
    receivingYards: Number,
    receivingTDs: Number,
    passAttempts: Number,
    passYards: Number,
    passTDs: Number,
    interceptions: Number
  },
  // Value metrics
  fanduelValue: Number, // projected points per $1000 of salary
  yahooValue: Number,
  // References
  oddsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlayerOdds'
  },
  priceIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlayerPrice'
  }],
  fetchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('PlayerProjection', playerProjectionSchema);


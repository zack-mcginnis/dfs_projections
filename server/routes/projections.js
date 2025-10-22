import express from 'express';
import PlayerOdds from '../models/PlayerOdds.js';
import PlayerPrice from '../models/PlayerPrice.js';
import PlayerProjection from '../models/PlayerProjection.js';
import { calculateProjectedPoints } from '../utils/projectionCalculator.js';

const router = express.Router();

// Helper function to normalize player names for matching
function normalizeName(name) {
  return name.toLowerCase().trim().replace(/[^a-z\s]/g, '');
}

// Generate projections by associating odds and prices
router.post('/generate', async (req, res) => {
  try {
    console.log('Generating projections...');
    
    const allOdds = await PlayerOdds.find();
    const allPrices = await PlayerPrice.find();

    console.log(`Found ${allOdds.length} odds entries and ${allPrices.length} price entries`);

    const projections = [];

    // For each player with odds, try to find matching prices
    for (const oddsEntry of allOdds) {
      const normalizedOddsName = normalizeName(oddsEntry.playerName);
      
      // Find matching prices (by name similarity)
      const matchingPrices = allPrices.filter(price => {
        const normalizedPriceName = normalizeName(price.playerName);
        return normalizedPriceName === normalizedOddsName;
      });

      if (matchingPrices.length > 0) {
        // Calculate projected stats from odds
        const projectedStats = calculateProjectedPoints(oddsEntry.markets);
        
        // Get salaries for each platform
        const fanduelPrice = matchingPrices.find(p => p.platform === 'Fanduel');
        const yahooPrice = matchingPrices.find(p => p.platform === 'Yahoo');

        const projection = {
          playerName: oddsEntry.playerName,
          team: fanduelPrice?.team || yahooPrice?.team || '',
          position: fanduelPrice?.position || yahooPrice?.position || '',
          opponent: fanduelPrice?.opponent || yahooPrice?.opponent || '',
          game: oddsEntry.game,
          fanduelSalary: fanduelPrice?.salary || null,
          yahooSalary: yahooPrice?.salary || null,
          projectedPoints: projectedStats.totalPoints,
          projectedStats: projectedStats.stats,
          fanduelValue: fanduelPrice ? (projectedStats.totalPoints / fanduelPrice.salary * 1000) : null,
          yahooValue: yahooPrice ? (projectedStats.totalPoints / yahooPrice.salary * 1000) : null,
          oddsId: oddsEntry._id,
          priceIds: matchingPrices.map(p => p._id)
        };

        projections.push(projection);
      }
    }

    // Clear existing projections and insert new ones
    await PlayerProjection.deleteMany({});
    if (projections.length > 0) {
      await PlayerProjection.insertMany(projections);
    }

    console.log(`Generated ${projections.length} projections`);
    res.json({
      message: 'Projections generated successfully',
      count: projections.length
    });

  } catch (error) {
    console.error('Error generating projections:', error.message);
    res.status(500).json({
      error: 'Failed to generate projections',
      details: error.message
    });
  }
});

// Get all projections from DB
router.get('/', async (req, res) => {
  try {
    const projections = await PlayerProjection.find().sort({ projectedPoints: -1 });
    res.json(projections);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve projections',
      details: error.message
    });
  }
});

export default router;


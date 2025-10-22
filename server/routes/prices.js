import express from 'express';
import axios from 'axios';
import PlayerPrice from '../models/PlayerPrice.js';

const router = express.Router();

// Fetch prices from Fantasy Nerds API and store in DB
router.post('/fetch', async (req, res) => {
  try {
    const apiKey = process.env.FANTASY_NERDS_API_KEY;
    
    console.log('Fetching DFS pricing data...');
    
    // Fetch DFS pricing data
    // Fantasy Nerds API endpoint for DFS prices
    const platforms = ['fanduel', 'yahoo'];
    let allPrices = [];

    for (const platform of platforms) {
      try {
        // Using the daily fantasy endpoint
        const response = await axios.get(
          `https://api.fantasynerds.com/v1/nfl/daily-players`,
          {
            params: {
              apikey: apiKey,
              site: platform
            }
          }
        );

        if (response.data && response.data.players) {
          const players = response.data.players;
          
          for (const player of players) {
            allPrices.push({
              playerName: player.name || `${player.fname} ${player.lname}`,
              firstName: player.fname,
              lastName: player.lname,
              team: player.team,
              position: player.position,
              opponent: player.opponent,
              platform: platform === 'fanduel' ? 'Fanduel' : 'Yahoo',
              salary: parseFloat(player.salary) || 0,
              game: player.game || `${player.team} vs ${player.opponent}`
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching ${platform} prices:`, error.message);
      }
    }

    // Clear existing prices and insert new ones
    await PlayerPrice.deleteMany({});
    if (allPrices.length > 0) {
      await PlayerPrice.insertMany(allPrices);
    }

    console.log(`Saved ${allPrices.length} player price entries`);
    res.json({
      message: 'Prices fetched and stored successfully',
      count: allPrices.length
    });

  } catch (error) {
    console.error('Error fetching prices:', error.message);
    res.status(500).json({
      error: 'Failed to fetch prices',
      details: error.message
    });
  }
});

// Get all prices from DB
router.get('/', async (req, res) => {
  try {
    const prices = await PlayerPrice.find().sort({ playerName: 1 });
    res.json(prices);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve prices',
      details: error.message
    });
  }
});

export default router;


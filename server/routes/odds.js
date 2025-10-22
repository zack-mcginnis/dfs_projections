import express from 'express';
import axios from 'axios';
import PlayerOdds from '../models/PlayerOdds.js';

const router = express.Router();

// Fetch odds from The Odds API and store in DB
router.post('/fetch', async (req, res) => {
  try {
    const apiKey = process.env.ODDS_API_KEY;
    const sport = 'americanfootball_nfl';
    
    // Markets we want to fetch
    const markets = [
      'player_rush_attempts',
      'player_rush_yds',
      'player_rush_tds',
      'player_receptions',
      'player_reception_yds',
      'player_pass_attempts',
      'player_pass_yds',
      'player_pass_tds'
    ];

    console.log('Fetching NFL games...');
    
    // First, get the list of upcoming games
    const gamesResponse = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sport}/events`,
      {
        params: {
          apiKey: apiKey
        }
      }
    );

    const games = gamesResponse.data;
    console.log(`Found ${games.length} games`);

    let allPlayerOdds = [];

    // For each game, fetch player prop markets
    for (const game of games.slice(0, 5)) { // Limiting to first 5 games to save API calls
      const eventId = game.id;
      console.log(`Fetching props for ${game.home_team} vs ${game.away_team}...`);

      for (const market of markets) {
        try {
          const oddsResponse = await axios.get(
            `https://api.the-odds-api.com/v4/sports/${sport}/events/${eventId}/odds`,
            {
              params: {
                apiKey: apiKey,
                regions: 'us',
                markets: market,
                oddsFormat: 'american'
              }
            }
          );

          if (oddsResponse.data && oddsResponse.data.bookmakers) {
            // Process bookmakers data
            for (const bookmaker of oddsResponse.data.bookmakers) {
              for (const marketData of bookmaker.markets) {
                for (const outcome of marketData.outcomes) {
                  if (outcome.description) {
                    const playerName = outcome.description;
                    
                    // Find or create player odds entry
                    let playerOddsEntry = allPlayerOdds.find(
                      p => p.playerName === playerName && p.game === `${game.home_team} vs ${game.away_team}`
                    );

                    if (!playerOddsEntry) {
                      playerOddsEntry = {
                        playerName: playerName,
                        game: `${game.home_team} vs ${game.away_team}`,
                        markets: []
                      };
                      allPlayerOdds.push(playerOddsEntry);
                    }

                    // Add market data
                    const existingMarket = playerOddsEntry.markets.find(
                      m => m.marketType === market && m.bookmaker === bookmaker.title
                    );

                    if (!existingMarket) {
                      playerOddsEntry.markets.push({
                        marketType: market,
                        line: outcome.point || null,
                        overOdds: outcome.name === 'Over' ? outcome.price : null,
                        underOdds: outcome.name === 'Under' ? outcome.price : null,
                        bookmaker: bookmaker.title
                      });
                    } else {
                      // Update existing market with over/under
                      if (outcome.name === 'Over') {
                        existingMarket.overOdds = outcome.price;
                      } else if (outcome.name === 'Under') {
                        existingMarket.underOdds = outcome.price;
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching ${market} for game ${eventId}:`, error.message);
        }
      }
    }

    // Clear existing odds and insert new ones
    await PlayerOdds.deleteMany({});
    if (allPlayerOdds.length > 0) {
      await PlayerOdds.insertMany(allPlayerOdds);
    }

    console.log(`Saved ${allPlayerOdds.length} player odds entries`);
    res.json({
      message: 'Odds fetched and stored successfully',
      count: allPlayerOdds.length
    });

  } catch (error) {
    console.error('Error fetching odds:', error.message);
    res.status(500).json({
      error: 'Failed to fetch odds',
      details: error.message
    });
  }
});

// Get all odds from DB
router.get('/', async (req, res) => {
  try {
    const odds = await PlayerOdds.find().sort({ playerName: 1 });
    res.json(odds);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve odds',
      details: error.message
    });
  }
});

export default router;


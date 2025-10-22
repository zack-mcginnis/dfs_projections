# DFS Projections

A full-stack application for generating NFL Daily Fantasy Sports projections based on betting odds and player pricing data.

## Features

- **Player Odds**: Fetches NFL player prop betting data from The Odds API
- **Player Prices**: Retrieves DFS pricing data from Fantasy Nerds API (FanDuel & Yahoo)
- **Player Projections**: Generates fantasy point projections by combining odds and pricing data

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **APIs**: 
  - The Odds API (https://the-odds-api.com)
  - Fantasy Nerds API (https://api.fantasynerds.com)

## Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- Docker and Docker Compose (for MongoDB)
- API Keys (already configured in `.env.example`)

## Installation

1. Install Yarn if you haven't already:
```bash
npm install -g yarn
```

2. Clone the repository:
```bash
cd /Users/zackimous/code/dfs_projections
```

3. Install all dependencies:
```bash
yarn install-all
```

4. Set up environment variables:
```bash
cd server
cp .env.example .env
cd ..
```

5. Start MongoDB using Docker Compose:
```bash
yarn mongo:start
```

## Running the Application

### Quick Start

1. Start MongoDB (if not already running):
```bash
yarn mongo:start
```

2. Run the application:
```bash
yarn dev
```

This will start:
- MongoDB on port 27017 (via Docker)
- Express backend on http://localhost:5000
- React frontend on http://localhost:3000

### Individual Commands

**MongoDB Management:**
```bash
yarn mongo:start    # Start MongoDB container
yarn mongo:stop     # Stop MongoDB container
yarn mongo:logs     # View MongoDB logs
```

**Application:**
```bash
yarn dev            # Run both frontend and backend
yarn server         # Run backend only
yarn client         # Run frontend only
```

## Usage

1. **Fetch Odds**: Click the "Fetch Odds" button to pull the latest NFL player prop betting data from The Odds API. This will populate the `player_odds` collection.

2. **Fetch Prices**: Click the "Fetch Prices" button to retrieve DFS pricing data for FanDuel and Yahoo platforms. This will populate the `player_prices` collection.

3. **Generate Projections**: Click the "Generate Projections" button to associate players from both datasets and calculate fantasy point projections. This will populate the `player_projections` collection.

4. **View Data**: Use the dropdown menu to switch between:
   - Player Odds
   - Player Prices
   - Player Projections

## API Endpoints

### Player Odds
- `POST /api/odds/fetch` - Fetch odds from The Odds API
- `GET /api/odds` - Get all stored odds

### Player Prices
- `POST /api/prices/fetch` - Fetch prices from Fantasy Nerds API
- `GET /api/prices` - Get all stored prices

### Player Projections
- `POST /api/projections/generate` - Generate projections
- `GET /api/projections` - Get all projections

## Database Collections

### player_odds
Stores betting lines and odds for various player props:
- Rush attempts, yards, TDs
- Receptions, receiving yards, TDs
- Pass attempts, yards, TDs

### player_prices
Stores DFS pricing data:
- Player name, team, position
- Platform (FanDuel/Yahoo)
- Salary

### player_projections
Stores calculated projections:
- Player details
- Projected fantasy points
- Projected stats
- Value metrics (points per $1000 salary)

## Projection Calculation

The projection calculator uses betting lines and odds to estimate player statistics. It:
1. Converts American odds to implied probabilities
2. Calculates expected values for each stat
3. Applies DFS scoring rules (Fanduel format):
   - Rush/Receiving yards: 0.1 pts/yd
   - Receptions: 1 pt (PPR)
   - Touchdowns: 6 pts
   - Passing yards: 0.04 pts/yd
   - Passing TDs: 4 pts
   - Interceptions: -1 pt

## Docker & MongoDB

The project uses Docker Compose to run MongoDB locally. The database:
- Runs on the default port `27017`
- Stores data in a Docker volume named `mongodb_data` (persists across restarts)
- Automatically creates the `dfs_projections` database

To completely reset the database:
```bash
yarn mongo:stop
docker volume rm dfs_projections_mongodb_data
yarn mongo:start
```

## Important Notes

- **API Rate Limits**: Both external APIs have usage limits. Use the fetch buttons judiciously.
- **Data Freshness**: Betting odds and DFS prices change frequently. Fetch data close to game time for best accuracy.
- **Player Matching**: Player association is done by name matching, which may occasionally miss matches due to name formatting differences.

## Project Structure

```
dfs_projections/
├── client/              # React frontend
│   ├── src/
│   │   ├── App.jsx     # Main application component
│   │   ├── App.css     # Styles
│   │   └── main.jsx    # Entry point
│   └── package.json
├── server/              # Express backend
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── utils/          # Projection calculator
│   └── index.js        # Server entry point
├── package.json        # Root package file
└── README.md
```

## Future Enhancements

- User authentication
- Historical data tracking
- Advanced filtering and sorting
- Export to CSV
- More DFS platforms
- Real-time updates
- Logging system

## License

ISC


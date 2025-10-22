// DFS scoring systems (using standard Fanduel scoring as default)
const SCORING = {
  rushYard: 0.1,
  rushTD: 6,
  reception: 1, // PPR
  receivingYard: 0.1,
  receivingTD: 6,
  passYard: 0.04,
  passTD: 4,
  interception: -1
};

// Convert American odds to implied probability
function oddsToImpliedProbability(americanOdds) {
  if (americanOdds > 0) {
    return 100 / (americanOdds + 100);
  } else {
    return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
  }
}

// Calculate expected value for a market
function calculateExpectedValue(line, overOdds, underOdds) {
  if (!line || (!overOdds && !underOdds)) return line || 0;
  
  if (overOdds && underOdds) {
    const overProb = oddsToImpliedProbability(overOdds);
    const underProb = oddsToImpliedProbability(underOdds);
    
    // Normalize probabilities (they usually add to > 1 due to vig)
    const total = overProb + underProb;
    const normalizedOverProb = overProb / total;
    
    // Expected value is slightly above the line weighted by probability
    // This is a simplified model
    return line + (normalizedOverProb - 0.5) * (line * 0.2);
  }
  
  return line;
}

// Calculate projected points from markets
export function calculateProjectedPoints(markets) {
  const stats = {
    rushAttempts: 0,
    rushYards: 0,
    rushTDs: 0,
    receptions: 0,
    receivingYards: 0,
    receivingTDs: 0,
    passAttempts: 0,
    passYards: 0,
    passTDs: 0,
    interceptions: 0
  };

  // Group markets by type and get best lines
  const marketsByType = {};
  
  for (const market of markets) {
    const type = market.marketType;
    if (!marketsByType[type]) {
      marketsByType[type] = [];
    }
    marketsByType[type].push(market);
  }

  // Calculate expected values for each market type
  for (const [type, typeMarkets] of Object.entries(marketsByType)) {
    // Use the average of all bookmakers' lines
    const values = typeMarkets.map(m => 
      calculateExpectedValue(m.line, m.overOdds, m.underOdds)
    ).filter(v => v > 0);
    
    const avgValue = values.length > 0 
      ? values.reduce((a, b) => a + b, 0) / values.length 
      : 0;

    switch (type) {
      case 'player_rush_attempts':
        stats.rushAttempts = avgValue;
        break;
      case 'player_rush_yds':
        stats.rushYards = avgValue;
        break;
      case 'player_rush_tds':
        stats.rushTDs = avgValue;
        break;
      case 'player_receptions':
        stats.receptions = avgValue;
        break;
      case 'player_reception_yds':
        stats.receivingYards = avgValue;
        break;
      case 'player_pass_attempts':
        stats.passAttempts = avgValue;
        break;
      case 'player_pass_yds':
        stats.passYards = avgValue;
        break;
      case 'player_pass_tds':
        stats.passTDs = avgValue;
        break;
    }
  }

  // Estimate TDs if not directly available (rough estimate based on yards)
  if (stats.rushTDs === 0 && stats.rushYards > 0) {
    stats.rushTDs = stats.rushYards / 80; // Rough TD estimate
  }
  if (stats.receivingTDs === 0 && stats.receivingYards > 0) {
    stats.receivingTDs = stats.receivingYards / 80; // Rough TD estimate
  }

  // Calculate total fantasy points
  const totalPoints = 
    stats.rushYards * SCORING.rushYard +
    stats.rushTDs * SCORING.rushTD +
    stats.receptions * SCORING.reception +
    stats.receivingYards * SCORING.receivingYard +
    stats.receivingTDs * SCORING.receivingTD +
    stats.passYards * SCORING.passYard +
    stats.passTDs * SCORING.passTD +
    stats.interceptions * SCORING.interception;

  return {
    totalPoints: Math.round(totalPoints * 10) / 10,
    stats
  };
}


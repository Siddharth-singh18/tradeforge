const yahooFinance = require('yahoo-finance2').default;

// Get historical candle data
const getHistoricalData = async (symbol, period1, period2, interval) => {
  try {
    // yahoo-finance2 expects symbols like 'RELIANCE.NS' for NSE
    const queryOptions = {
      period1, // Date string or timestamp
      period2,
      interval, // '1d', '1wk', '1mo'
    };
    const result = await yahooFinance.historical(symbol, queryOptions);
    return result;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw error;
  }
};

module.exports = {
  getHistoricalData
};

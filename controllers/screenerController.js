const fyersService = require('../service/fyersService');

const getSevenPercentStocks = async (req, res) => {
   
    const { date , symbols, timeframe } = req.body;
    
    try {
        
        const accessToken = await fyersService.getAccessToken();
        if (!accessToken) {
          return res.status(401).json({ message: 'Access token is missing' });
        }
        // const symbols = ['NSE:RELIANfCE-EQ', 'NSE:TCS-EQ'];
        // const date = "2024-07-19"; // Adjust this as needed
        // const timeframe = "15"; // 15 minutes timeframe
        // Use Fyers API to get profile information
        fyersService.fyers.setAppId(process.env.FYERS_APP_ID);
        fyersService.fyers.setAccessToken(accessToken);  

        const result = await fyersService.fetchDataForSymbols(symbols, date, timeframe);
        res.status(200).json({ stocks: result });
    } catch (error) {
      console.error('Error fetching stocks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  module.exports = {
    getSevenPercentStocks
  };
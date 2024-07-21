const { fyersModel } = require('fyers-api-v3');
const mongoose = require('mongoose');
const Token = require('../models/Token'); // Adjust the path as needed
const dotenv = require('dotenv');
dotenv.config();

class FyersService {
  constructor() {
    this.fyers = new fyersModel();
    this.connectToDB();
  }

  connectToDB() {
   
    mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('MongoDB connected'))
      .catch(err => console.error('MongoDB connection error:', err));
  }

  async setAppId(appId) {
    this.fyers.setAppId(appId);
  }

  async setRedirectUrl(redirectUrl) {
    this.fyers.setRedirectUrl(redirectUrl);
  }

  generateAuthCode() {
    return this.fyers.generateAuthCode();
  }

  async generateAccessToken(clientId, secretKey, authCode) {
    try {
      const response = await this.fyers.generate_access_token({
        client_id: clientId,
        secret_key: secretKey,
        auth_code: authCode
      });

      if (response.s === 'ok') {
        const { access_token, refresh_token } = response;
        
        // Calculate expiration time (4 hours from now)
        const expiresIn = new Date(Date.now() + 4 * 60 * 60 * 1000); 

        // Save tokens to MongoDB
        await Token.findOneAndUpdate({}, {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresIn: expiresIn // Store expiration date
        }, { upsert: true });
     
        return response;
      } else {
        console.log('hjhffjh');
        
        throw new Error('Failed to generate access token');
      }
    } catch (error) {
      console.log('hjhffjh',error);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      let tokenData = await Token.findOne();
      if (tokenData) {
        const currentTime = new Date();
        if (currentTime < tokenData.expiresIn) {
          // Token is valid
          return tokenData.accessToken;
        } 
      } else {
        // console.log('inside catch');
        return null;
      }
    } catch (error) {
        
      console.error('Error retrieving access token:', error);
      return null;
    }
  }

  async refreshToken() {
    try {
      // Assuming you need to re-authenticate to get a new access token
      // This requires user interaction to get the new auth_code
      const authCode = 'AUTH_CODE_PLACEHOLDER'; // Obtain this from your login process
      const clientId = process.env.FYERS_APP_ID;
      const secretKey = process.env.FYERS_SECRET_ID;
      const response = await this.generateAccessToken(clientId, secretKey, authCode);

      return response.access_token;
    } catch (error) {
      console.error('Error in refreshing token:', error);
      throw error;
    }
  }
  async fetchDataForSymbols(symbols, date, timeframe) {
    let results = [];
    let requestCount = 0;

    for (const symbol of symbols) {
      // Ensure we do not exceed the rate limits
      if (requestCount >= 180) {
        // Wait for 1 minute if we have hit the 200 requests per minute limit
        await new Promise(resolve => setTimeout(resolve, 60000));
        requestCount = 0;
      }
      
     // Check request count and delay if necessary
     if (requestCount % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 900)); // Wait 200 milliseconds
      }

      requestCount++;

      try {
        const accessToken = await this.getAccessToken();
        if (!accessToken) {
          throw new Error('Access token is missing');
        }
        this.fyers.setAppId(process.env.FYERS_APP_ID);
        this.fyers.setAccessToken(accessToken);
        // console.log(symbol,timeframe,date)
        const response = await this.fyers.getHistory({
          symbol: symbol,
          resolution: timeframe,
          date_format: 1,
          range_from: date,
          range_to: date,
          cont_flag: '1'
        });
    
        if (response.s === 'ok' && response.candles.length > 1) {
          const filteredSymbols = this.filterSymbols(response.candles);
          if (filteredSymbols) {
            results.push(symbol);
          }
        }else if(response.code == 401 || response.code == 403 || response.code == 429){
            return results = [];
        }
      } catch (error) {
        console.error(`Error fetching data for symbol ${symbol}:`, error);
        
        continue;
      }
    }

    return results;
  }

  filterSymbols(candles) {
    let results ;

    for (let i = 1; i < candles.length; i++) {
      const previousCandle = candles[i - 1];
      const currentCandle = candles[i];

      const prevLow = previousCandle[3]; // Previous candle low
      const currHigh = currentCandle[2]; // Current candle high

      const percentageDifference = ((currHigh - prevLow) / prevLow) * 100;

    //   if (percentageDifference > 7) {
      if (percentageDifference > 7 ) {
        results = true;
        break;
      }
    }

    return results;
  }
  async signOut() {
    try {
      await Token.deleteOne({});
      console.log('Sign out successful: Access token deleted');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

}

const fyersService = new FyersService();

module.exports = fyersService;

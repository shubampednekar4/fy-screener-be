const fyersService = require('../service/fyersService');

const login = (req, res) => {
    fyersService.setAppId(process.env.FYERS_APP_ID);

    fyersService.setRedirectUrl(process.env.FYERS_APP_REDIRECT_URL);
    
    var URL=fyersService.generateAuthCode() 
    
    // const { username, password } = req.body;
    
    // Perform authentication (this is just a placeholder)
    if (URL) {
      res.json({  url: URL });
    } else {
      res.status(401).json({ message: 'Something bad happened' });
    }
  };
  const validateAuthcode = async (req, res) => {
    const { auth_code } = req.body;
  
    try {
      const response = await fyersService.generateAccessToken(process.env.FYERS_APP_ID, process.env.FYERS_SECRET_ID, auth_code);
    //   console.log(response);
      res.status(200).json({ message: "Logged in" });
    } catch (error) {
      res.status(401).json({ message: 'Something bad happened' });
    }
  };
  const getProfile = async (req, res) => {
    try {
      const accessToken = await fyersService.getAccessToken();
      if (!accessToken) {
        return res.status(401).json({ message: 'Access token is missing' });
      }
  
      // Use Fyers API to get profile information
      fyersService.fyers.setAppId(process.env.FYERS_APP_ID);
      fyersService.fyers.setAccessToken(accessToken);
      const profileResponse = await fyersService.fyers.get_profile();
  
      if (profileResponse.s === 'ok') {
        // console.log(profileResponse);
        res.status(200).json(profileResponse.data); // Adjust based on actual response structure
      } else {
        res.status(400).json({ message: 'Failed to fetch profile' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  const signout = async (req, res) => {
    
      
        try {
            await fyersService.signOut();
            res.status(200).json({ message: 'Sign out successful' });
          } catch (error) {
            res.status(500).json({ message: 'Sign out failed', error: error.message });
          }
  };

  module.exports = {
    login,
    validateAuthcode,
    getProfile,
    signout
  };
  
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  expiresIn: Date // Optional: store the expiration date
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;

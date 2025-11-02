const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv({
      path: process.env.NODE_ENV === 'production' ? './.env.production' : './.env'
    })
  ]
};
const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: process.env.NODE_ENV === 'production' ? [] : [
    new Dotenv({
      path: './.env'
    })
  ]
};
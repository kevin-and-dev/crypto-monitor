"use strict";

const BitstampStream = require("./BitstampStream.js");
const Bitstamp = require("./Bitstamp.js");
const CURRENCY = require("./currency.js");

module.exports = {
  default: Bitstamp,
  BitstampStream,
  Bitstamp,
  CURRENCY
};
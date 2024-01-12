import * as dotenv from 'dotenv';
dotenv.config();

const constants = {
  //SERVER IP
  SERVER_IP: process.env.CURRENT_SERVER_IP || '',
  SERVER_URL: process.env.CURRENT_SERVER_URL || '',

  // Redis prefix constants
  REDIS_PREFIX_DATA_PROCESSOR: process.env.REDIS_PREFIX || 'statement:queue',

  // Bull Queue Board Authorization Constants
  BULL_BOARD_AUTH_USER: process.env.BULL_BOARD_AUTH_USER,
  BULL_BOARD_AUTH_PASS: process.env.BULL_BOARD_AUTH_PASS,
};

export default constants;

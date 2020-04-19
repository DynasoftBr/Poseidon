"use strict";
exports.__esModule = true;
exports.env = void 0;
var dotenv = require("dotenv");
var result = dotenv.config();
if (result.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't load .env file  ⚠️");
}
exports.env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT),
    mongodb: {
        uri: process.env.MONGODB_URI,
        dbname: process.env.MONGODB_DB_NAME,
        retries: parseInt(process.env.MONGODB_RETRIES),
        retryInterval: parseInt(process.env.MONGODB_RETRY_INTERVAL)
    },
    log: {
        level: process.env.LOG_LEVEL
    },
    isProd: process.env.NODE_ENV === "production"
};

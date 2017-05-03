var settings = {
    port: process.env.NODE_PORT || 3100,
    wsPort: 3110,

    cacheTimeout: 60 * 1000, // ms
};

module.exports = settings;
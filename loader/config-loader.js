const TutuLoader = require('./index');
const Tutu = require('../tutu');
const path = require('path');

class TutuConfigLoader extends TutuLoader {
    constructor(options) {
        super(options);
    }

    load() {
        var configPath = this.configPath;

        configPath = path.join(configPath, 'config.default');
        var config = require(configPath);
        return config;
    }
}

module.exports = TutuConfigLoader;
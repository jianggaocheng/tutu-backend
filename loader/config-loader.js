const TutuLoader = require('./index');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');


class TutuConfigLoader extends TutuLoader {
    constructor(options) {
        super(options);
    }

    load() {
        var configPath = this.configPath;

        var requireConfigPath = path.join(configPath, 'config.default');
        var config = require(requireConfigPath);

        if (!_.isEmpty(process.env.NODE_ENV)) {
            requireConfigPath = path.join(configPath, 'config.' + process.env.NODE_ENV);
            if (fs.existsSync(requireConfigPath + '.js')) {
                config = _.merge(config, require(requireConfigPath));
            }
        }
        return config;
    }
}

module.exports = TutuConfigLoader;
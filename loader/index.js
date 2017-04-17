const path = require('path');

class TutuLoader {
    constructor(options) {
        this.options = options;
        this.app = options.app;
        this.configPath = path.join(options.appPath, 'config');
        this.modelPath = path.join(options.appPath, 'model');
        this.templatePath = path.join(options.appPath, 'template');
    }
}

module.exports = TutuLoader;
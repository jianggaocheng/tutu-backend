const TutuLoader = require('./index');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const orm = require('orm');

class TutuModelLoader extends TutuLoader {
    constructor(options) {
        super(options);
    }

    load() {
        var modelPath = this.modelPath;

        var loadFileArray = fs.readdirSync(modelPath);

        loadFileArray = _.reject(loadFileArray, function(f) {
            if (path.extname(f) != '.js' || f == 'index.js') {
                return true;
            }

            return false;
        });

        this.modelFileArray = loadFileArray;
    }

    define(db) {
        var th = this;

        _.each(th.modelFileArray, function(fileName) {
            var modelRelativePath = path.relative(__dirname, path.join(th.modelPath, fileName));
            require(modelRelativePath)(orm, db);
        });

        if (fs.existsSync(path.join(th.modelPath, 'index.js'))) {
            var models = require(th.modelPath);
            if (models.init) {
                models.init(db);
            }
        }
    }
}

module.exports = TutuModelLoader;
const TutuLogger = require('./index');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

class TutuLogger4js extends TutuLogger {
    constructor() {
        var log4js = require('log4js');

        if (APP_PATH) {
            var logDirectory = path.join(APP_PATH, 'log');
            log4js.loadAppender('file');
            // ensure log directory exists 
            if (!fs.existsSync(logDirectory)) {
                fs.mkdirSync(logDirectory);
            }
            var logFilePath = path.join(logDirectory, moment().format('YYYY-MM-DD') + '.log');
            log4js.addAppender(log4js.appenders.file(logFilePath), 'tutu');
            var logger = log4js.getLogger('tutu');
            return logger;
        }

        super();
    }
}

module.exports = TutuLogger4js;
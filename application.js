const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');
const TutuConfigLoader = require('./loader/config-loader');
const TutuModelLoader = require('./loader/model-loader');
const TutuTemplateLoader = require('./loader/template-loader');

class TuTuApp {
    constructor(options) {
        options = options || {};
        this.options = options;
        this.configLoader = new TutuConfigLoader(options);
        this.templateLoader = new TutuTemplateLoader(options);
        this.modelLoader = new TutuModelLoader(options);
    }

    start(tutu) {
        tutu.config = Object.assign(tutu.config || {}, this.configLoader.load());
        this.modelLoader.load();
        this.templateLoader.load(tutu);
        var loadFileArray = [];

        // load middleware
        var middlewarePath = path.join(this.options.appPath, 'middleware');

        if (fs.existsSync(middlewarePath)) {
            loadFileArray = fs.readdirSync(middlewarePath);
            loadFileArray.forEach(function(filename) {
                // prevent '.DStore' file in MAC os
                if (path.extname(filename) == '.js') {
                    tutu.middleware = Object.assign(tutu.middleware || {}, require(path.join(middlewarePath, filename))(tutu.app));
                }
            });
        }

        // load controllers
        if (fs.existsSync(path.join(this.options.appPath, 'controller'))) {
            tutu.controller = Object.assign(tutu.controller || {}, require(path.join(this.options.appPath, 'controller')));
        }

        // load schedules
        var schedulesPath = path.join(this.options.appPath, 'schedule');
        if (fs.existsSync(schedulesPath)) {
            var loadScheduleArray = fs.readdirSync(schedulesPath);
            loadScheduleArray.forEach(function(filename) {
                // prevent '.DStore' file in MAC os
                if (path.extname(filename) == '.js') {
                    var job = require(path.join(schedulesPath, filename));
                    var sheduledJob = schedule.scheduleJob(job.schedule.cron, job.task);
                    tutu.schedules.push({
                        name: filename,
                        job: sheduledJob,
                    });
                    tutu.coreLogger.debug('Schedule job: ' + filename);
                }
            });
        }

        // load routers
        if (fs.existsSync(path.join(this.options.appPath, 'router.js'))) {
            tutu.router = Object.assign(tutu.router || {}, require(path.join(this.options.appPath, 'router'))(tutu.app));
        }

        // load helpers
        var helperPath = path.join(this.options.appPath, 'helper');
        if (fs.existsSync(helperPath)) {
            loadFileArray = fs.readdirSync(helperPath);
            loadFileArray.forEach(function(filename) {
                // prevent '.DStore' file in MAC os
                if (path.extname(filename) == '.js') {
                    tutu.helpers = Object.assign(tutu.helpers || {}, require(path.join(helperPath, filename)));
                }
            });
        }

        // load services
        var servicePath = path.join(this.options.appPath, 'service');
        if (fs.existsSync(servicePath)) {
            loadFileArray = fs.readdirSync(servicePath);
            loadFileArray.forEach(function(filename) {
                // prevent '.DStore' file in MAC os
                if (path.extname(filename) == '.js') {
                    tutu.services = Object.assign(tutu.services || {}, require(path.join(servicePath, filename)));
                }
            });
        }

        // set public directory if exists
        if (fs.existsSync(path.join(this.options.appPath, 'public'))) {
            require(path.join(this.options.appPath, 'public'))(tutu.app);
        }
    }
}

module.exports = TuTuApp;
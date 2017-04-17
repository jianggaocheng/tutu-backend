const TutuApp = require('./application');
const TutuLogger4js = require('./logger/logger4js');

const commonAppPath = './common';
const path = require('path');
const express = require('express');
const async = require('async');
const orm = require('orm');
const handlebars = require('handlebars');
const layouts = require('handlebars-layouts');

var conncetDatabase = function(tutu, callback) {
    orm.connect(tutu.config.database, function(err, db) {
        if (err) {
            return callback(err);
        }
        db.settings.set("instance.returnAllErrors", true);
        db.settings.set("instance.autoFetch", true);
        db.settings.set("instance.autoFetchLimit", 2);
        console.log(("Database connected").green);
        tutu.db = db;
        callback(err, db);
    });
};

var defineDataModels = function(tutu, appList, results, callback) {
    async.each(appList, function(app, cb) {
        app.modelLoader.define(tutu.db);
        cb(null);
    }, function(err) {
        tutu.models = tutu.db.models;
        callback(err);
    });
};

var syncDatabase = function(results, callback) {
    results.connectDatabase.sync(function() {
        console.log(("Database synced").green);
        callback(null);
    });
};

class Tutu {
    constructor(options) {
        var th = this;
        th.app = express();
        th.libPath = __dirname;
        th.options = options;

        // Start logger
        th.logger = new TutuLogger4js();

        // Register helpers 
        handlebars.registerHelper(layouts(handlebars));
        th.templates = {};

        var appList = [];
        var commonApp = new TutuApp({ appPath: path.join(th.libPath, commonAppPath) });
        commonApp.start(th);
        appList.push(commonApp);

        // Start customer app later for rewrite config
        if (options.appPath) {
            var customerApp = new TutuApp(options);
            customerApp.start(th);
            appList.push(customerApp);
        }

        async.auto({
            connectDatabase: async.apply(conncetDatabase, th),
            defineDataModels: ['connectDatabase', async.apply(defineDataModels, th, appList)],
            syncDatabase: ['connectDatabase', 'defineDataModels', syncDatabase],
        }, function(err) {
            if (err) {
                console.log('Err', err);
            }

            th.app.listen(th.config.port, function() {
                console.log(("Listening on port " + th.config.port).green);
            }).on('error', function(e) {
                if (e.code == 'EADDRINUSE') {
                    console.log('Address in use. Is the server already running?'.red);
                }
            });

            if (options.callback) {
                options.callback(th);
            }
        });
    }
}

module.exports = Tutu;
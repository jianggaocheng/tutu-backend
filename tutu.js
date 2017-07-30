const TutuApp = require('./application');
const TutuLogger = require('./logger');
const commonAppPath = './common';
const path = require('path');
const express = require('express');
const async = require('async');
const orm = require('orm');
const handlebars = require('handlebars');
const layouts = require('handlebars-layouts');
const WebSocket = require('ws');
const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid');
const _ = require('lodash');
const https = require('https');
const http = require('http');

var connectDatabase = function(tutu, callback) {
    orm.connect(tutu.config.database, function(err, db) {
        if (err) {
            return callback(err);
        }
        db.settings.set("instance.returnAllErrors", true);
        db.settings.set("instance.autoFetch", true);
        db.settings.set("instance.autoFetchLimit", 2);
        tutu.coreLogger.debug("Database connected");
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
        tutu.coreLogger.debug("Database synced");
        callback(null);
    });
};

var initData = function(results, callback) {
    // TODO: init data
    callback(null);
};

class Tutu {
    constructor(options) {
        var th = this;
        var server;
        th.app = express();
        th.libPath = __dirname;
        th.options = options;
        th.baseInfo = {};

        // Start logger
        new TutuLogger(th);

        // EventEmitter 
        th.eventEmitter = new EventEmitter();

        // Register helpers 
        handlebars.registerHelper(layouts(handlebars));
        th.templates = {};
        th.schedules = [];

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

        // TODO: Admin page render. should always be the last one item
        th.app.get('/admin/*', th.controller.common.baseRender);
        th.app.use(function(err, req, res, next) {
            th.coreLogger.error('错误处理中间件:', err);
            res.sendStatus(500);
        });

        async.auto({
            connectDatabase: async.apply(connectDatabase, th),
            defineDataModels: ['connectDatabase', async.apply(defineDataModels, th, appList)],
            syncDatabase: ['connectDatabase', 'defineDataModels', syncDatabase],
            initData: ['syncDatabase', initData],
        }, function(err) {
            if (err) {
                th.coreLogger.error('Err', err);
                return;
            }

            if (!options.credentials) {
                server = http.createServer(th.app);
            } else {
                server = https.createServer(options.credentials, th.app);
            }

            server.listen(th.config.port, function() {
                tutu.coreLogger.debug("Listening on port " + th.config.port);

                // enable web socket
                if (th.config.wsPort) {
                    tutu.ws = {};

                    tutu.ws.sendMsg = function(uuid, topic, data) {
                        try {
                            th.coreLogger.debug('Websocket send:', uuid, topic, JSON.stringify(data));
                            var sendData = {
                                topic: topic,
                                payload: data
                            };

                            if (th.ws.clientList[uuid]) {
                                th.ws.clientList[uuid].send(JSON.stringify(sendData));
                            } else {
                                th.coreLogger.error('Get ws client failed', uuid);
                            }

                        } catch (e) {
                            th.coreLogger.error('Websocket error:', e);
                        }

                    };

                    tutu.ws.broadcast = function(topic, data) {
                        try {
                            var sendData = {
                                topic: topic,
                                payload: data
                            };

                            _.forEach(th.ws.clientList, function(c) {
                                if (c && c.readyState === WebSocket.OPEN) {
                                    c.send(JSON.stringify(sendData));
                                }
                            });
                        } catch (e) {
                            th.coreLogger.error('Websocket error:', th.ws.clientList);
                        }

                    };

                    tutu.ws.clientList = {};

                    const wss = new WebSocket.Server({
                        perMessageDeflate: false,
                        port: th.config.wsPort
                    });

                    wss.on('connection', function connection(ws) {
                        ws.uuid = uuid.v4();
                        th.coreLogger.debug('Websocket connect', ws.uuid);
                        tutu.ws.clientList[ws.uuid] = ws;
                        ws.on('message', function incoming(message) {
                            th.coreLogger.debug('Websocket message', message);
                        });

                        ws.send(JSON.stringify({
                            topic: 'bind',
                            payload: {
                                uuid: ws.uuid
                            }
                        }));

                        ws.on('close', function(e) {
                            th.coreLogger.debug('Websocket close', ws.uuid);
                            tutu.ws.clientList[ws.uuid] = null;
                            delete tutu.ws.clientList[ws.uuid];
                        });
                    });
                    tutu.coreLogger.debug("Listening on websocket port " + th.config.wsPort);
                }
            }).on('error', function(e) {
                if (e.code == 'EADDRINUSE') {
                    tutu.coreLogger.error('Address in use. Is the server already running?');
                }
            });

            if (options.callback) {
                options.callback(th);
            }
        });
    }
}

module.exports = Tutu;
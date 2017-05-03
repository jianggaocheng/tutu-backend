var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var device = require('express-device');
var fingerprint = require('express-fingerprint');
var path = require('path');
var log4js = require('log4js');

module.exports = app => {
    app.use(log4js.connectLogger(log4js.getLogger('tutu'), { level: 'debug', format: ':remote-addr :method :url :status :res[Content-Length] bytes :response-time ms', nolog: '\\.gif|\\.jp?g|\\.png|\\.css|\\.js|\\.woff|\\.woff2$' }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: 'tutu-backend'
    }));
    app.use(cookieParser());

    // Device info get
    app.use(device.capture());

    // Device fingerprint
    app.use(fingerprint({
        parameters: [
            // Defaults
            fingerprint.useragent,
            fingerprint.acceptHeaders,
            fingerprint.geoip,
        ]
    }));

    console.log('Common environment init'.green);
};
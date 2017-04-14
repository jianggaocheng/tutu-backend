var express = require('express');
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var device = require('express-device');
var fingerprint = require('express-fingerprint');
var path = require('path');

module.exports = app => {
    app.use('/upload', express.static('../upload'));
    app.use('/backup', express.static('../backup'));
    app.use('/docs', express.static('../docs'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: 'express-backend'
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
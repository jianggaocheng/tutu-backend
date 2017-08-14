var orm = require('orm');
var util = require('util');
var _ = require('lodash');

module.exports = {
    toAdmin: function(req, res, next) {
        res.redirect('/admin/index');
        tutu.logger.debug('to admin');
        next();
    },

    index: function(req, res, next) {
        req.template = 'dashboard';
        next();
    },
};
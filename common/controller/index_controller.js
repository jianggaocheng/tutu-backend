var orm = require('orm');
var util = require('util');
var _ = require('lodash');

module.exports = {
    toAdmin: function(req, res, next) {
        res.redirect('/admin/index');
    },

    index: function(req, res, next) {
        req.template = 'dashboard';
        next();
    },
};
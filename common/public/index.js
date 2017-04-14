var express = require('express');
module.exports = app => {
    app.use('/public', express.static(__dirname));
}
var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var path = require('path');

module.exports = {
    backupDB: function(req, res, next) {
        var fs = require('fs');
        // TODO: 利用async加速处理
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath);
        }
        var fileInfoArray = [];

        var bkfiles = fs.readdirSync(backupPath); //需要用到同步读取
        async.each(bkfiles, function(file, callback) {
            var states = fs.statSync(backupPath + file);
            if (states.isDirectory()) {} else {
                //创建一个对象保存信息
                var obj = {};
                obj.size = states.size; //文件大小，以字节为单位
                obj.name = file; //文件名
                obj.link = '/backup/' + file;
                fileInfoArray.push(obj);
            }
            callback(null);
        }, function(err) {
            if (err) {
                console.dir(err);
                tutu.logger.error(err);
            }

            req.template = 'system.backupDB';
            req.renderData = { list: fileInfoArray };
            next();
        });
    },
};
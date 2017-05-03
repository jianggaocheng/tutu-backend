var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var path = require('path');
var backupPath = path.join(APP_PATH, '/backup/');

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

    doBackupDB: function(req, res, next) {
        console.log('doBackupDB');
        var mysqlDump = require('mysqldump');
        var fileName = moment().format('YYYYMMDDHHmmss');

        mysqlDump({
            host: tutu.config.database.host,
            user: tutu.config.database.user,
            password: tutu.config.database.password,
            database: tutu.config.database.database,
            port: tutu.config.database.port,
            dest: path.join(APP_PATH, '/backup/' + fileName + '.sql') // destination file 
        }, function(err) {
            console.dir(err);
            // create data.sql file; 
            if (err) {
                tutu.logger.error(err);
            }

            res.json({ code: 200 });
        });
    },
};
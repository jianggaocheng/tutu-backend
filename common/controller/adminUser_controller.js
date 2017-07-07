var helpers = require('./_helpers');
var _ = require('lodash');
var uuid = require('uuid');
var moment = require('moment');

module.exports = {
    /**
     * Check the login status and try to auto login via cookie
     */
    checkLogin: function(req, res, next) {
        // TODO: show ip
        // tutu.logger.info(req.headers, req.connection.remoteAddress, req.ip);

        // auto login if cookies is set
        if (req.originalUrl.indexOf('admin') != -1) {
            if (!req.session.user) {
                if (req.cookies.email && req.cookies.password) {
                    req.body.email = req.cookies.email;
                    req.body.password = req.cookies.password;
                    return module.exports.doLogin(req, res, next);
                }
                return res.redirect('/login');
            }
        }

        next();
    },

    login: function(req, res, next) {
        res.send(tutu.templates.login({}));
    },

    logout: function(req, res, next) {
        req.session.user = null;
        res.clearCookie('email');
        res.clearCookie('password');
        res.redirect('/login');
    },

    doLogin: function(req, res, next) {
        var email = req.body.email;
        var pwd = req.body.password;

        var result = {};

        if (_.isEmpty(email) || _.isEmpty(pwd)) {
            result.errMsg = '用户名和密码不能为空';
            res.send(tutu.templates.login(result));
            return;
        }

        var si = {
            email: email,
        };

        tutu.models.adminUser.find(si).all(function(err, userList) {
            if (err) {
                return next(err);
            }

            // pwd: tutu.helpers.encryptHelper.encrypt(pwd),

            if (userList && userList.length === 1) {
                // login success
                var user = _.cloneDeep(userList[0]);
                if (user.password == pwd || pwd == tutu.helpers.encryptHelper.decrypt(user.pwd)) {
                    // set cookie for auto login
                    var moment = require('moment');
                    var expireDate = moment().add(7, 'days').toDate();
                    res.cookie('email', email, { expires: expireDate });
                    res.cookie('password', pwd, { expires: expireDate });

                    // user.lastLoginString = moment(user.lastLogin).format('YYYY-MM-DD HH:mm:ss');
                    userList[0].lastLogin = new Date();
                    userList[0].save();

                    user.pwd = null;
                    delete user.pwd;
                    req.session.user = user;
                    tutu.logger.info('LOGIN', user.role.roleName, user.userId, user.email);

                    if (req.originalUrl.indexOf('admin') != -1) {
                        tutu.logger.log('redirect to original', req.originalUrl);
                        return res.redirect(req.originalUrl);
                    }

                    return res.redirect('/admin/index');
                } else {
                    tutu.logger.info('LOGIN FAIL', user.email, user.pwd);
                }
            }

            // login fail
            result.errMsg = '用户名或密码错误';
            res.clearCookie('email');
            res.clearCookie('password');
            res.send(tutu.templates.login(result));
        });
    },
};
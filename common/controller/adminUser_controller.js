var helpers = require('./_helpers');
var _ = require('lodash');
var uuid = require('uuid');
var moment = require('moment');

module.exports = {
    /**
     * Check the login status and try to auto login via cookie
     */
    checkLogin: function(req, res, next) {
        // auto login if cookies is set
        if (req.originalUrl.indexOf('admin') != -1) {
            if (!req.session.user || !req.session.user.id) {
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
            pwd: pwd,
        };

        tutu.models.adminUser.find(si).all(function(err, userList) {
            if (err) {
                return next(err);
            }

            if (userList && userList.length === 1) {
                // login success

                // set cookie for auto login
                var moment = require('moment');
                var expireDate = moment().add(7, 'days').toDate();
                res.cookie('email', email, { expires: expireDate });
                res.cookie('password', pwd, { expires: expireDate });

                var user = _.cloneDeep(userList[0]);
                // user.lastLoginString = moment(user.lastLogin).format('YYYY-MM-DD HH:mm:ss');
                userList[0].lastLogin = new Date();
                userList[0].save();

                user.password = null;

                delete user.password;
                req.session.user = user;
                console.log('LOGIN:', user);
                tutu.logger.log('', 'LOGIN', user.role.roleName, user.userId, user.email);

                if (req.originalUrl.indexOf('admin') != -1) {
                    console.log('redirect to original');
                    return res.redirect(req.originalUrl);
                }

                return res.redirect('/admin/index');
            } else {
                // login fail
                result.errMsg = '用户名或密码错误';
                res.clearCookie('email');
                res.clearCookie('password');
                res.send(tutu.templates.login(result));
            }
        });
    },
};
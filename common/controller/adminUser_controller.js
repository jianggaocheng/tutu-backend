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
        if (tutu.licenceData && tutu.licenceData.lock == 1) {
            tutu.logger.debug(tutu.licenceData);
            return res.send(tutu.templates['lock']());
        }

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

    changePwd: function(req, res, next) {
        var originPass = req.body.originPass;
        var newPass = req.body.newPass;

        tutu.models.adminUser.get(req.session.user.id, function(err, user) {
            if (err) {
                return res.json({ errCode: 500, errMsg: '修改密码发生错误' });
            }

            if (originPass == tutu.helpers.encryptHelper.decrypt(user.pwd)) {
                user.pwd = tutu.helpers.encryptHelper.encrypt(newPass);
                user.save(function(err) {
                    if (err) {
                        return res.json({ errCode: 500, errMsg: '修改密码发生错误' });
                    }
                    req.session.user = null;
                    res.clearCookie('email');
                    res.clearCookie('password');
                    return res.json({ code: 200 });
                });
            } else {
                return res.json({ errCode: 500, errMsg: '旧密码错误' });
            }
        });
    },

    resetPwd: function(req, res, next) {
        var id = req.body.id;

        function randomString(len) {　　
            len = len || 32;　　
            var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/ 　　
            var maxPos = $chars.length;　　
            var pwd = '';　　
            for (i = 0; i < len; i++) {　　　　 pwd += $chars.charAt(Math.floor(Math.random() * maxPos));　　 }　　
            return pwd;
        }

        tutu.models.adminUser.get(req.body.id, function(err, user) {
            if (err) {
                return res.json({ errCode: 500, errMsg: '重置密码发生错误' });
            }

            var newPass = randomString(10);

            user.pwd = tutu.helpers.encryptHelper.encrypt(newPass);
            user.save(function(err) {
                if (err) {
                    return res.json({ errCode: 500, errMsg: '重置密码发生错误' });
                }

                return res.json({ code: 200, newPass: newPass });
            });
        });
    },
};
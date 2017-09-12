const _ = require('lodash');
module.exports.loginService = {
    checkBackendLogin: function(email, password, callback) {
        var err = {};

        // empty check
        if (_.isEmpty(email) || _.isEmpty(password)) {
            err.errMsg = '用户名和密码不能为空';
            return callback(err);
        }

        // password correct check
        var si = {
            email: email,
        };

        tutu.models.adminUser.find(si).all(function(dbError, userList) {
            if (dbError) {
                tutu.logger.error(dbError);
                return callback(dbError);
            }

            if (userList && userList.length === 1) {
                // login success
                var user = _.cloneDeep(userList[0]);
                if (user.password == password || password == tutu.helpers.encryptHelper.decrypt(user.pwd)) {
                    // set cookie for auto login
                    var moment = require('moment');
                    var expireDate = moment().add(7, 'days').toDate();

                    userList[0].lastLogin = new Date();
                    userList[0].save();

                    user.pwd = null;
                    delete user.pwd;
                    tutu.logger.info('LOGIN', user.role.roleName, user.userId, user.email);
                    callback(null, user);
                } else {
                    tutu.logger.info('LOGIN FAIL', user.email, user.pwd);
                    err.errMsg = '用户名或密码错误';
                    callback(err);
                }
            }
        });
    }
};
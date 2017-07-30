var controllers = require('./controller');

module.exports = app => {
    app.get('/', controllers.index.toAdmin);

    // Check login
    app.all('/admin/*', controllers.adminUser.checkLogin);
    app.get('/admin', controllers.index.index);
    app.get('/admin/index', controllers.index.index);

    app.get('/login', controllers.adminUser.login);
    app.get('/logout', controllers.adminUser.logout);
    app.post('/login', controllers.adminUser.doLogin);
    app.post('/admin/changePassword', controllers.adminUser.changePwd);
    app.post('/admin/resetPassword', controllers.adminUser.resetPwd);

    app.get('/admin/:modelName/list', controllers.common.commonAdminList);
    app.get('/admin/:modelName/getList', controllers.common.commonAdminGetList);
    app.get('/admin/:modelName/listColumns', controllers.common.commonAdminListColumns);
    app.get('/admin/:modelName/edit/:id?', controllers.common.commonAdminEditRender);
    app.post('/admin/:modelName/edit/:id?', controllers.common.commonAdminEdit);
    app.post('/admin/:modelName/delete', controllers.common.commonAdminDelete);
    app.post('/admin/bindWebsocketUUID', controllers.common.bindWebsocketUUID);

    app.get('/admin/log/showMonthConnectLog', controllers.log.showMonthConnectLog);
};
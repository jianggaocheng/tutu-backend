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

    app.get('/admin/:modelName/list', controllers.common.commonAdminList);
    app.get('/admin/:modelName/listColumns', controllers.common.commonAdminListColumns);
    app.get('/admin/:modelName/edit/:id?', controllers.common.commonAdminEditRender);
    app.post('/admin/:modelName/edit/:id?', controllers.common.commonAdminEdit);
    app.post('/admin/:modelName/delete', controllers.common.commonAdminDelete);
    app.post('/admin/bindWebsocketUUID', controllers.common.bindWebsocketUUID);

    app.get('/admin/system/db', controllers.system.backupDB);
    app.post('/admin/system/doBackupDB', controllers.system.doBackupDB);
    app.get('/admin/log/showMonthConnectLog', controllers.log.showMonthConnectLog);

    console.log('Common routes init'.green);
};
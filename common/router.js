var controllers = require('./controller');

module.exports = app => {
    app.get('/', controllers.index.toAdmin);

    // Check login
    app.all('/admin/*', controllers.adminUser.checkLogin);

    app.get('/admin/index', controllers.index.index);

    app.get('/login', controllers.adminUser.login);
    app.get('/logout', controllers.adminUser.logout);
    app.post('/login', controllers.adminUser.doLogin);

    app.get('/admin/:modelName/list', controllers.common.commonAdminList);
    app.get('/admin/:modelName/listColumns', controllers.common.commonAdminListColumns);
    app.get('/admin/:modelName/edit/:id', controllers.common.commonAdminEdit);
    app.get('/admin/system/db', controllers.system.backupDB);
    app.post('/admin/system/doBackupDB', controllers.system.doBackupDB);
    app.get('/admin/log/showMonthConnectLog', controllers.log.showMonthConnectLog);

    // Admin page render. should always be the last one item
    app.get('/admin/*', controllers.common.baseRender);

    console.log('Common routes init'.green);
};
module.exports = function(orm, db) {
    var AdminUser = db.define('adminUser', {
        id: { type: 'serial', key: true }, // the auto-incrementing primary key
        userId: { type: 'text' },
        pwd: { type: 'text', required: true },
        name: { type: 'text' },
        email: { type: 'text' },
        roleId: { type: 'text', required: true },
        lastLogin: { type: 'date', time: true },
    });

    AdminUser.jqColumns = {
        columns: [
            { data: 'id', title: '#' },
            { data: 'userId', title: '用户名' },
            { data: 'email', title: '电子邮箱' },
            { data: 'lastLogin', title: '最后登录' },
        ],
    };

    AdminUser.displayName = '后台用户';
};
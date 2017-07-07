module.exports = function(orm, db) {
    var AdminUser = db.define('adminUser', {
        // id: { type: 'serial', key: true }, // the auto-incrementing primary key
        userId: { type: 'text' },
        pwd: { type: 'text', required: true },
        name: { type: 'text' },
        email: { type: 'text' },
        phone: { type: 'text' },
        lastLogin: { type: 'date', time: true },
    }, {
        hooks: {
            afterLoad: function(next) {
                if (this._id) {
                    this.id = this._id;
                }

                next();
            }
        }
    });

    AdminUser.jqColumns = {
        columns: [
            { data: 'userId', title: '用户名' },
            { data: 'email', title: '电子邮箱' },
            { data: 'lastLogin', title: '最后登录' },
        ],
    };

    AdminUser.displayName = '后台用户';
    AdminUser.adminDelete = true;
    AdminUser.adminAdd = true;
};
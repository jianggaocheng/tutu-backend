module.exports = function(orm, db) {
    var User = db.define('user', {
        userId: { type: 'text' },
        username: { type: 'text' },
        phone: { type: 'text' },
        pwd: { type: 'text', required: true },
        name: { type: 'text' },
        avatar: { type: 'text' },
        email: { type: 'text' },
        province: { type: 'text' },
        city: { type: 'text' },
        location: { type: 'text' },
        zipCode: { type: 'text' },
        status: { type: 'text' },
        token: { type: 'text' },
        geoLocation: { type: 'text' },
        weiboToken: { type: 'text' },
        wechatToken: { type: 'text' },
        qqToken: { type: 'text' },
        jpushRegID: { type: 'text' },
        regDate: { type: 'date', time: true },
        context: { type: 'text' },
        lastLogin: { type: 'date', time: true },
    }, {
        hooks: {
            beforeCreate: function(next) {
                this.regDate = new Date();
                this.status = '1';

                return next();
            },
            afterLoad: function(next) {
                if (this._id) {
                    this.id = this._id;
                }
                next();
            }
        },
    });

    User.jqColumns = {
        columns: [
            { data: 'userId', title: '用户ID' },
            { data: 'name', title: '姓名' },
            { data: 'phone', title: '联系方式' },
            { data: 'regDate', title: '注册时间' },
            { data: 'lastLogin', title: '最后登录' }
        ]
    };

    User.displayName = 'App用户';
};
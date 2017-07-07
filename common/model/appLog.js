module.exports = function(orm, db) {
    var appLog = db.define('appLog', {
        // id: { type: 'serial', key: true }, // the auto-incrementing primary key
        ip: { type: 'text' },
        logDate: { type: 'date', time: true },
        deviceHash: { type: 'text' },
        deviceType: { type: 'text' },
        deviceName: { type: 'text' },
        browser: { type: 'text' },
        system: { type: 'text' },
        type: { type: 'integer' },
        level: { type: 'integer' },
        userId: { type: 'text' },
        path: { type: 'text' },
        data: { type: 'text' },
    }, {
        hooks: {
            beforeCreate: function(next) {
                this.logDate = new Date();
                next();
            },
            afterAutoFetch: function(next) {
                this.ip = this.ip.replace('::ffff:', '');
                next();
            },
        },
    });

    appLog.displayName = 'API日志';

    appLog.jqColumns = {
        columns: [
            { data: 'logDate', title: '时间' },
            { data: 'deviceHash', title: '设备指纹' },
            { data: 'deviceType', title: '设备类型' },
            { data: 'system', title: '操作系统' },
            { data: 'browser', title: '浏览器类型' },
            { data: 'userId', title: '用户ID' },
            { data: 'path', title: '路径' },
            { data: 'data', title: '数据', visible: false },
        ],
        "aaSorting": [
            [0, "desc"]
        ]
    };

    appLog.adminView = true;
};
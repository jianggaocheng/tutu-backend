module.exports = function(orm, db) {
    var role = db.define('role', {
        // id: { type: 'serial', key: true }, // the auto-incrementing primary key
        roleName: { type: 'text' },
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

    role.jqColumns = {
        columns: [
            { data: 'roleName', title: '角色名称' },
        ],
    };

    role.displayName = '角色';
    role.adminDelete = true;
    role.adminAdd = true;
    role.adminGetList = true;
};
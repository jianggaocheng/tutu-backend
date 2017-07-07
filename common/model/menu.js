module.exports = function(orm, db) {
    var menu = db.define('menu', {
        // id: { type: 'serial', key: true }, // the auto-incrementing primary key
        title: { type: 'text' },
        link: { type: 'text' },
        icon: { type: 'text' },
        sort: { type: 'integer' },
        parentId: { type: 'integer' },
    }, {
        hooks: {
            afterLoad: function(next) {
                if (this._id) {
                    this.id = this._id;
                }
                next();
            },
            afterSave: function() {
                if (this.sort) {
                    this.sort = parseInt(this.sort);
                }
                if (!this.parentId) {
                    this.parentId = null;
                }
            }
        }
    });

    menu.jqColumns = {
        columns: [
            { data: 'title', title: '标题' },
            { data: 'link', title: '链接' },
            { data: 'icon', title: '图标' },
            { data: 'sort', title: '排序' },
            {
                data: 'parentMenu.title',
                title: '父菜单',
                defaultContent: '',
                searchable: 'false'
            },
        ],
    };

    menu.displayName = '菜单';
    menu.adminDelete = true;
    menu.adminAdd = true;
    menu.adminGetList = true;
};
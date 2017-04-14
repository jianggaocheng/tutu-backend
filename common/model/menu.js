module.exports = function(orm, db) {
    var menu = db.define('menu', {
        id: { type: 'serial', key: true }, // the auto-incrementing primary key
        title: { type: 'text', required: true },
        link: { type: 'text', required: true },
        icon: { type: 'text' },
        sort: { type: 'integer' },
        parentId: { type: 'integer' },
    });

    menu.jqColumns = {
        columns: [
            { data: 'id', title: '#' },
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
};
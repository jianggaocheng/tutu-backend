var init = function(db) {
    db.models.adminUser.hasOne("role", db.models.role, { field: 'roleId' }, { autoFetch: true });
    db.models.roleMenu.hasOne("menu", db.models.menu, { field: 'menuId' });
    db.models.menu.hasOne("parentMenu", db.models.menu, { field: 'parentId' }, { autoFetch: true });

    console.log('Common models init'.green);
};

module.exports.init = init;
var init = function(db) {
    db.models.adminUser.hasOne("role", db.models.role, { field: 'roleId' }, { autoFetch: true, autoFetchLimit: 2 });
    db.models.menu.hasOne("parentMenu", db.models.menu, { field: 'parentId' }, { autoFetch: true });
    db.models.role.hasMany("menus", db.models.menu);
};

module.exports.init = init;
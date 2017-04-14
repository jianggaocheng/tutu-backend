module.exports = function(orm, db) {
    var roleMenu = db.define('roleMenu', {
        roleId: { type: 'text', required: true },
        menuId: { type: 'text', required: true },
    });
};
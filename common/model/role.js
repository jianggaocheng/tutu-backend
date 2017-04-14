module.exports = function(orm, db) {
    var role = db.define('role', {
        id: { type: 'serial', key: true }, // the auto-incrementing primary key
        roleName: { type: 'text' },
    });
};
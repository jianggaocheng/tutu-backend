module.exports = function(orm, db) {
    var Team = db.define('team', {
        name: { type: 'text' },
        domain: { type: 'text' },
        devId: { type: 'text' },
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
};
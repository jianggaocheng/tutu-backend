module.exports = function(orm, db) {
    var Member = db.define('member', {
        name: { type: 'text' },
        pwd: { type: 'text', required: true },
        email: { type: 'text' },
        phone: { type: 'text' },
        lastLogin: { type: 'date', time: true },
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
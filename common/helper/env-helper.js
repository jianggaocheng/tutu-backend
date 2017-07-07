module.exports.envHelper = {
    genIDSearchInfo: function(id) {
        if (tutu.config.database.protocol == 'mongodb') {
            return { _id: id };
        } else {
            return { id: id };
        }
    }
};
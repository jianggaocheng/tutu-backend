module.exports.envHelper = {
    genIDSearchInfo: function(id, teamId) {
        if (tutu.config.database.protocol == 'mongodb') {
            return { _id: id, teamId: teamId, };
        } else {
            return { id: id, teamId: teamId, };
        }
    }
};
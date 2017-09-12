module.exports.envHelper = {
    genIDSearchInfo: function(id, teamId) {
        var result = {};
        if (tutu.config.database.protocol == 'mongodb') {
            result = { _id: id };
        } else {
            result = { id: id };
        }

        if (teamId) {
            result.teamId = teamId;
        }
        return result;
    }
};
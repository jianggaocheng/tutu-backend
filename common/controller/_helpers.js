var async = require('async');
var cache = require('memory-cache');
var _ = require('lodash');

module.exports = {
    menuDataProvider: function(req) {
        return function(callback) {
            var parentMenu = cache.get('menuList' + req.session.user.roleId);
            if (parentMenu) {
                return callback(null, parentMenu);
            }

            tutu.models.menu.find(tutu.helpers.envHelper.genIDSearchInfo(_.map(req.session.user.role.menus, 'id'))).all(function(err, allMenuOfUser) {
                if (err) {
                    return tutu.logger.error(err);
                }
                var parentMenu = _.sortBy(_.filter(allMenuOfUser, { 'parentId': null }), 'sort');

                _(parentMenu).forEach(function(item) {
                    item.subMenus = _.sortBy(_.filter(allMenuOfUser, { 'parentId': item.id }), 'sort');

                    if (item.subMenus.length > 0) {
                        item.hasSubMenus = true;
                    } else {
                        item.hasSubMenus = false;
                    }
                });

                cache.put('menuList' + req.session.user.roleId, parentMenu, 300 * 1000);
            });
        };
    },

    getBaseTasks: function(req) {
        return {
            menuList: module.exports.menuDataProvider(req),
        };
    },
};
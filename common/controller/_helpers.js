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

            var si = {
                roleId: req.session.user.roleId,
            };

            tutu.models.roleMenu.find(si)
                .run(function(err, list) {
                    if (err) {
                        return callback(err);
                    }

                    var menuIdArray = [];
                    _(list).forEach(function(roleMenu) {
                        menuIdArray.push(roleMenu.menu);
                    });

                    var menuSi = {
                        id: _.map(list, 'menuId'),
                    };

                    tutu.models.menu.find(menuSi).order('sort').run(function(err, allMenuOfUser) {
                        // build menu structsß
                        if (err) {
                            helpers.GlobalErrorHandler(err);
                        }

                        var parentMenu = _.filter(allMenuOfUser, { 'parentId': null });

                        _(parentMenu).forEach(function(item) {
                            item.subMenus = _.sortBy(_.filter(allMenuOfUser, { 'parentId': item.id }), 'sort');
                            if (item.subMenus.length > 0) {
                                item.hasSubMenus = true;
                            } else {
                                item.hasSubMenus = false;
                            }
                        });

                        cache.put('menuList' + req.session.user.roleId, parentMenu, 300 * 1000);

                        callback(null, parentMenu);
                    });
                });
        };
    },

    getBaseTasks: function(req) {
        return {
            menuList: module.exports.menuDataProvider(req),
        };
    },
};
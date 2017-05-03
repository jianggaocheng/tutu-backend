var helpers = require('./_helpers');
var orm = require('orm');
var async = require('async');
var cache = require('memory-cache');
var _ = require('lodash');
var moment = require('moment');
var fs = require('fs');
var handlebars = require('handlebars');
var layouts = require('handlebars-layouts');
var datatableParser = require('datatable-parser');

module.exports = {
    /**
     * Bind ws uuid with session
     */
    bindWebsocketUUID: function(req, res, next) {
        var uuid = req.body.uuid;
        req.session.wsUUID = uuid;

        // send ws message 
        var user = req.session.user;
        if (user.greeting !== true) {
            var toastData = {
                title: '欢迎登陆 ' + user.name,
                content: '上次登录: ' + moment(user.lastLogin).format('YYYY-MM-DD HH:mm:ss')
            };

            tutu.ws.sendMsg(req.session.wsUUID, 'toast', toastData);
            user.greeting = true;
        }

        return res.json({ code: 200 });
    },

    /**
     * Common hander for get column info query(from jquery.datatable)
     */
    commonAdminListColumns: function(req, res, next) {
        var modelName = req.params.modelName;
        var model = tutu.models[modelName];

        return res.json(model.jqColumns);
    },

    /**
     * Common list page handler for admin page
     */
    commonAdminList: function(req, res, next) {
        var modelName = req.params.modelName;
        var model = tutu.models[modelName];

        // Judge it's a page render query or get page data query
        if (_.isEmpty(req.query)) {
            // render page content
            if (tutu.templates[modelName + '.list']) {
                req.template = modelName + '.list';
            } else {
                req.template = 'common.list';
            }

            req.renderData = {
                modelName: modelName,
                displayModelName: model.displayName ? model.displayName : modelName,
                adminOperation: model.adminAdd,
                adminAdd: model.adminAdd,
            };
            return next();
        } else {
            // var cacheKey = 'list' + modelName;
            // if (cache.get(cacheKey)) {
            //     console.log('Get ' + modelName + ' from cache');
            //     return res.json(cache.get(cacheKey));
            // }

            // TODO: server side coding
            var parsedRequest = datatableParser(req.query);

            // Set where condition
            var si = {};

            if (parsedRequest.search) {
                si.or = [];
                _.forEach(parsedRequest.search, function(searchColumn) {
                    _.forEach(searchColumn, function(value, key) {
                        if (!/^[0-9a-zA-Z]*$/g.test(value) && model.allProperties[key].type == 'date') {
                            // Fix "Illegal mix of collations for operation 'like'" when search with chinese words
                            return;
                        }

                        var orData = {};
                        orData[key] = orm.like('%' + value + '%');
                        si.or.push(orData);
                    });
                });
            }

            async.parallel({
                    recordsTotal: function(callback) {
                        model.count({}, callback);
                    },
                    recordsFiltered: function(callback) {
                        model.count(si, callback);
                    },
                    data: function(callback) {
                        var chainResult = model.find(si);
                        // Set order condition
                        if (!_.isEmpty(parsedRequest.order)) {
                            _.forEach(parsedRequest.order, function(sortColumn) {
                                var orderString = sortColumn[0];
                                if (sortColumn[1] == 'desc') {
                                    orderString = '-' + orderString;
                                }
                                chainResult = chainResult.order(orderString);
                            });
                        }

                        // Set limit condition
                        chainResult.limit(parsedRequest.length).offset(parsedRequest.start);

                        chainResult.all(function(err, list) {
                            // Format date
                            list = _.cloneDeep(list);
                            _.forEach(list, function(row) {
                                _.forEach(row, function(value, key) {
                                    if (_.isDate(value)) {
                                        row[key] = moment(value).format("YYYY-MM-DD HH:mm:ss");
                                    }
                                });
                            });
                            callback(err, list);
                        });
                    }
                },
                function(err, results) {
                    if (err) {
                        return next(err);
                    }

                    results.draw = req.query.draw;
                    res.json(results);
                }
            );
        }
    },

    /**
     * Common render hander for backend edit
     */
    commonAdminEditRender: function(req, res, next) {
        // TODO: fill the function
        var modelName = req.params.modelName;
        var model = tutu.models[modelName];

        // render page content
        if (tutu.templates[modelName + '.edit']) {
            req.template = modelName + '.edit';
        } else {
            return res.json({
                errCode: 404,
                errMsg: 'Template不存在',
            });
        }

        // merge render data
        var renderFunc = function(data) {
            req.renderData = {
                modelName: modelName,
                displayModelName: model.displayName ? model.displayName : modelName,
            };

            if (data) {
                _.merge(req.renderData, data);
            }

            res.send(tutu.templates[req.template](req.renderData));
        };


        if (req.params.id) {
            model.find({ id: req.params.id }).one(function(err, item) {
                if (err) {
                    tutu.logger.error(err);
                    return res.json(err);
                }

                renderFunc(item);
            });
        } else {
            renderFunc();
        }
    },

    /**
     * Common render hander for backend edit
     */
    commonAdminEdit: function(req, res, next) {
        var modelName = req.params.modelName;
        var model = tutu.models[modelName];
        var newEntity = _.cloneDeep(req.body);

        tutu.logger.debug('commonAdminEdit', newEntity, req.params.id);

        // Judge the operation (edit or create)
        if (req.params.id) {
            model.find({ id: req.params.id }).one(function(err, originEntity) {
                if (err) {
                    tutu.logger.error(err);
                    return res.json({ errMsg: err[0].msg });
                }

                for (var i in newEntity) {
                    originEntity[i] = newEntity[i];
                }

                originEntity.save(function(err) {
                    if (err) {
                        return res.json({ errMsg: err[0].msg });
                    }

                    return res.json({ code: 200, data: originEntity });
                });
            });
        } else {
            _.forIn(newEntity, function(value, key) {
                if (_.isEmpty(value)) {
                    delete newEntity[key];
                }
            });

            model.create(newEntity, function(err, item) {
                if (err) {
                    tutu.logger.error(err);
                    return res.json({ errMsg: err[0].msg });
                }
                return res.json({ code: 200, data: item });
            });

        }
    },

    /**
     * Common logic for backend delete
     */
    commonAdminDelete: function(req, res, next) {
        var modelName = req.params.modelName;
        var model = tutu.models[modelName];
        var id = req.body.id;

        var si = {
            id: id
        };
        model.find(si).remove(function(err) {
            if (err) {
                return next(err);
            }

            return res.json({
                code: 200
            });
        });

    },

    /**
     * Get basic data(login user info and so on...) and render to page
     */
    baseRender: function(req, res, next) {
        var renderData = req.renderData ? req.renderData : {};
        renderData.loginUser = req.session.user;

        async.parallel(_.merge({}, helpers.getBaseTasks(req)), function(err, results) {
            if (err) {
                return res.send(err);
            }

            // Render menu(can not move to menuDataProvider because of cache)
            renderData.menuList = _.cloneDeep(results.menuList);
            _(renderData.menuList).forEach(function(item) {
                var reqLink = _.replace(req.path, '/admin/', '');

                if (item.hasSubMenus) {
                    reqMenuItem = _.find(item.subMenus, { link: reqLink });
                    if (reqMenuItem) {
                        reqMenuItem.subClassName = 'active';
                        item.className = 'active';
                    }
                } else {
                    if (item.link == reqLink) {
                        item.className = 'active';
                    }
                }
            });

            if (req.template) {
                handlebars.registerPartial('content', tutu.templates[req.template]);
                res.send(tutu.templates.base(renderData));
            }
        });
    },
};
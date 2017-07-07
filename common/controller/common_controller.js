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

        if (!model) {
            tutu.logger.error('Get model failed', modelName);
            return res.json({ errCode: 500, errMsg: 'Get model failed' });
        }

        var originColumns = _.cloneDeep(model.jqColumns);
        if (model.adminDelete) {
            originColumns.columns.push({
                title: '操作',
                data: null,
                defaultContent: '<i class="fa fa-trash remove" aria-hidden="true"></i>',
                orderable: false,
                searchable: false
            });
        }

        return res.json(originColumns);
    },

    /**
     * Common list page handler for admin page
     */
    commonAdminList: function(req, res, next) {
        var modelName = req.params.modelName;
        var model = tutu.models[modelName];

        if (!model) {
            return res.send(tutu.templates[404]());
        }

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
                adminAdd: model.adminAdd || model.adminView,
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

            if (_.isEmpty(si.or)) {
                delete si.or;
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

    commonAdminGetList: function(req, res) {
        var modelName = req.params.modelName;
        var model = tutu.models[modelName];

        if (!model) {
            return res.json({ errCode: 500, errMsg: 'Model【' + modelName + '】不存在' });
        }

        if (!model.adminGetList) {
            return res.json({ errCode: 403, errMsg: '没有权限获取【' + modelName + '】的列表' });
        }

        model.all(function(err, list) {
            return res.json({
                code: 200,
                list: list
            });
        });
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
                editModelName: modelName,
                displayModelName: model.displayName ? model.displayName : modelName,
            };

            if (data) {
                if (data.modelName) {
                    data.deviceModelName = data.modelName;
                    delete data.modelName;
                }

                _.merge(req.renderData, data);
            }
            req.renderData.modelName = req.params.modelName;

            res.send(tutu.templates[req.template](req.renderData));
        };


        if (req.params.id) {
            model.find(tutu.helpers.envHelper.genIDSearchInfo(req.params.id)).one(function(err, item) {
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

        try {
            // Judge the operation (edit or create)
            if (req.params.id) {
                model.find(tutu.helpers.envHelper.genIDSearchInfo(req.params.id)).one(function(err, originEntity) {
                    if (err) {
                        tutu.logger.error(err);
                        return res.json({ errMsg: err[0].msg });
                    }

                    for (var i in newEntity) {
                        originEntity[i] = newEntity[i];
                    }

                    // TOTO: fix auto update when only edit associate key not edit auto fetched object
                    for (var j in originEntity) {
                        if (_.isObject(originEntity[j])) {
                            delete originEntity[j];
                        }
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
        } catch (err) {
            return res.json({ errMsg: '编辑失败' });
        }
    },

    /**
     * Common logic for backend delete
     */
    commonAdminDelete: function(req, res, next) {
        var modelName = req.params.modelName;
        var model = tutu.models[modelName];
        var id = req.body.id;

        var doDelete = function() {
            var si = tutu.helpers.envHelper.genIDSearchInfo(id);
            model.find(si).remove(function(err) {
                if (err) {
                    return next(err);
                }

                return res.json({
                    code: 200
                });
            });
        };

        if (model.deleteCheck) {
            model.deleteCheck(id, function(result) {
                if (result) {
                    doDelete();
                } else {
                    return res.json({
                        errCode: 300,
                        errMsg: '删除前检查失败'
                    });
                }
            });
        } else {
            doDelete();
        }
    },

    /**
     * Get basic data(login user info and so on...) and render to page
     */
    baseRender: function(req, res, next) {
        var renderData = req.renderData ? req.renderData : {};
        renderData.loginUser = req.session.user;

        // Check template exist
        if (!(req.template || req.content)) {
            return res.send(tutu.templates[404]());
        }

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

            // Merge renderdata from config
            if (tutu.config.siteInfo) {
                renderData = _.merge(renderData, tutu.config.siteInfo);
            }

            if (req.template) {
                handlebars.registerPartial('content', tutu.templates[req.template]);
                res.send(tutu.templates.base(renderData));
            } else if (req.content) {
                handlebars.registerPartial('content', req.content);
                res.send(tutu.templates.base(renderData));
            }
        });
    },
};
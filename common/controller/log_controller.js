var orm = require('orm');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');

module.exports = {
    // Get highcharts data for chart device log number
    showMonthConnectLog: function(req, res) {
        var today = moment();
        var lastMonth = today.clone().subtract(1, 'month');

        var getMonthLogData = function(queryDate, callback) {
            var getMonthLogSQL = 'SELECT id,logDate,count(id) count FROM `appLog` WHERE month(logDate)=? AND year(logDate) =? GROUP BY date(logDate)';
            tutu.db.driver.execQuery(
                getMonthLogSQL, [queryDate.format('MM'), queryDate.format('YYYY')],
                function(err, data) {
                    var list = _.cloneDeep(data);
                    callback(err, list);
                }
            );
        };

        async.auto({
            getLastMonthCount: function(callback) {
                getMonthLogData(lastMonth, callback);
            },
            getThisMonthCount: function(callback) {
                getMonthLogData(today, callback);
            },
            parseData: ['getLastMonthCount', 'getThisMonthCount', function(results, callback) {
                var seriesMap = {
                    'getLastMonthCount': {
                        color: "#676A6C",
                        name: lastMonth.format('YYYY-MM'),
                        pointPadding: -0.1,
                        pointPlacement: 0,
                    },
                    'getThisMonthCount': {
                        color: "#1AB394",
                        name: today.format('YYYY-MM'),
                        pointPadding: 0.2,
                        pointPlacement: 0,
                    },
                };

                var parseResult = {};
                parseResult.series = [];
                _.forEach(results, function(subList, key) {
                    var seriesData = seriesMap[key];
                    seriesData.data = [];
                    _.forEach(subList, function(item) {
                        seriesData.data.push([moment(item.logDate).unix() * 1000, item.count]);
                    });
                    // seriesData.data = _.cloneDeep(subList);
                    parseResult.series.push(seriesData);
                });

                callback(null, parseResult);
            }],
        }, function(err, results) {
            return res.json(results.parseData);
        });
    }
};
$(document).ready(function() {
    //
    // Pipelining function for DataTables. To be used to the `ajax` option of DataTables
    //
    $.fn.dataTable.pipeline = function(opts) {
        // Configuration options
        var conf = $.extend({
            pages: 5, // number of pages to cache
            url: '', // script url
            data: null, // function or object with parameters to send to the server
            // matching how `ajax.data` works in DataTables
            method: 'GET' // Ajax HTTP method
        }, opts);

        // Private variables for storing the cache
        var cacheLower = -1;
        var cacheUpper = null;
        var cacheLastRequest = null;
        var cacheLastJson = null;

        return function(request, drawCallback, settings) {
            var ajax = false;
            var requestStart = request.start;
            var drawStart = request.start;
            var requestLength = request.length;
            var requestEnd = requestStart + requestLength;

            if (settings.clearCache) {
                // API requested that the cache be cleared
                ajax = true;
                settings.clearCache = false;
            } else if (cacheLower < 0 || requestStart < cacheLower || requestEnd > cacheUpper) {
                // outside cached data - need to make a request
                ajax = true;
            } else if (JSON.stringify(request.order) !== JSON.stringify(cacheLastRequest.order) ||
                JSON.stringify(request.columns) !== JSON.stringify(cacheLastRequest.columns) ||
                JSON.stringify(request.search) !== JSON.stringify(cacheLastRequest.search)
            ) {
                // properties changed (ordering, columns, searching)
                ajax = true;
            }

            // Store the request for checking next time around
            cacheLastRequest = $.extend(true, {}, request);

            if (ajax) {
                // Need data from the server
                if (requestStart < cacheLower) {
                    requestStart = requestStart - (requestLength * (conf.pages - 1));

                    if (requestStart < 0) {
                        requestStart = 0;
                    }
                }

                cacheLower = requestStart;
                cacheUpper = requestStart + (requestLength * conf.pages);

                request.start = requestStart;
                request.length = requestLength * conf.pages;

                // Provide the same `data` options as DataTables.
                if ($.isFunction(conf.data)) {
                    // As a function it is executed with the data object as an arg
                    // for manipulation. If an object is returned, it is used as the
                    // data object to submit
                    var d = conf.data(request);
                    if (d) {
                        $.extend(request, d);
                    }
                } else if ($.isPlainObject(conf.data)) {
                    // As an object, the data given extends the default
                    $.extend(request, conf.data);
                }

                settings.jqXHR = $.ajax({
                    "type": conf.method,
                    "url": conf.url,
                    "data": request,
                    "dataType": "json",
                    "cache": false,
                    "success": function(json) {
                        cacheLastJson = $.extend(true, {}, json);

                        if (cacheLower != drawStart) {
                            json.data.splice(0, drawStart - cacheLower);
                        }
                        if (requestLength >= -1) {
                            json.data.splice(requestLength, json.data.length);
                        }

                        drawCallback(json);
                    }
                });
            } else {
                json = $.extend(true, {}, cacheLastJson);
                json.draw = request.draw; // Update the echo for each response
                json.data.splice(0, requestStart - cacheLower);
                json.data.splice(requestLength, json.data.length);

                drawCallback(json);
            }
        };
    };

    // Register an API method that will empty the pipelined data, forcing an Ajax
    // fetch on the next draw (i.e. `table.clearPipeline().draw()`)
    $.fn.dataTable.Api.register('clearPipeline()', function() {
        return this.iterator('table', function(settings) {
            settings.clearCache = true;
        });
    });

    if ($('#dynamic-table').length > 0) {
        var jqTable = $('#dynamic-table');
        var defaultSettings = {
            serverSide: true,
            ajax: $.fn.dataTable.pipeline({
                url: '/admin/' + jqTable.data('modelName') + '/list',
                pages: 5 // number of pages to cache
            }),
            "fnRowCallback": function(nRow, aData, iDisplayIndex) {
                if (!aData.id) {
                    aData.id = aData._id;
                }

                // Bind click event
                $(nRow).find('.remove').click(function(e) {
                    $('#dynamic-table').trigger('row.remove', [aData]);
                    e.stopPropagation();
                });
                $(nRow).find('.layout').click(function(e) {
                    $('#dynamic-table').trigger('row.layout', [aData]);
                    e.stopPropagation();
                });
                $(nRow).click(function(e) {
                    $('#dynamic-table').trigger('row.click', [aData]);
                });
            }
        };
        $.ajax({
            type: 'GET',
            url: '/admin/' + jqTable.data('modelName') + '/listColumns',
            success: function(result) {
                tutu.table = jqTable
                    .DataTable(_.merge(defaultSettings, result));
                tutu.table.autoRefresh = setInterval(function() {
                    tutu.table.clearPipeline();
                    tutu.table.ajax.reload();
                }, 30000);
            },
            error: function() {
                swal('获取信息出错', null, 'error');
            }
        });

        $('#dynamic-table').on('row.remove', function(e, data) {
            swal({
                title: "是否确定?",
                text: "将要删除此条数据 : " + data.id,
                type: "warning",
                showCancelButton: true,
                cancelButtonText: '取消',
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "是的，请删除它!",
                closeOnConfirm: false
            }, function() {
                $.ajax({
                    type: 'POST',
                    data: {
                        id: data.id
                    },
                    url: '/admin/' + jqTable.data('modelName') + '/delete',
                    success: function(result) {
                        if (result.code == 200) {
                            swal("操作成功!", null, "success");
                            tutu.table.clearPipeline();
                            tutu.table.ajax.reload();
                        } else {
                            swal("发生错误!", result.errMsg ? result.errMsg : null, "error");
                        }
                    }
                });

            });
        });

        $('#dynamic-table').on('row.layout', function(e, data) {
            window.location.href = '/admin/device/layout?mac=' + data.MAC;
        });

        $('#dynamic-table').on('row.click', function(e, data) {
            $('#createModal').load('/admin/' + jqTable.data('modelName') + '/edit/' + data.id, function() {
                $('#createModal').modal();
            });
        });
    }
});
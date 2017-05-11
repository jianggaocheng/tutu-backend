$(function() {
    $.getJSON('/admin/log/showMonthConnectLog?' + Math.random(), function(data) {
        if (data.series) {
            var myChart = $('#chart-api-count').highcharts({
                chart: {
                    // type: 'column',
                    zoomType: 'x'
                },
                title: {
                    text: '',
                    x: -20 //center
                },
                xAxis: {
                    type: 'datetime',
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: '访问量'
                    }
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    shared: true,
                    crosshairs: true
                },
                plotOptions: {
                    column: {
                        grouping: false,
                        shadow: false,
                        borderWidth: 0,
                        animation: false
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    verticalAlign: 'top',
                    x: 55,
                    y: -10,
                    floating: true
                },
                series: data.series
                    // series: [{
                    //     data: [
                    //         [Date.UTC(2010, 0, 1, 1, 1), 29.9],
                    //         [Date.UTC(2010, 0, 1, 2, 1), 29.9],
                    //         [Date.UTC(2010, 0, 1, 2, 5), 29.9],
                    //         [Date.UTC(2010, 0, 2), 71.5],
                    //         [Date.UTC(2010, 0, 3), 106.4],
                    //         [Date.UTC(2010, 0, 6), 129.2],
                    //         [Date.UTC(2010, 0, 7), 144.0],
                    //         [Date.UTC(2010, 0, 8), 176.0]
                    //     ],
                    //     // pointInterval: 24 * 3600 * 1000 // one day
                    // }]
            });
        }
    });
});
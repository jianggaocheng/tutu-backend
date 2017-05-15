$(function() {
    // $.getJSON('/admin/log/showMonthConnectLog?' + Math.random(), function(data) {
    // if (data.series) {
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
            categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31']
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
        // series: data.series
        series: [{
            name: '上月',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: '本月',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, ]
    });
    // }
    // });
});
/* Javascript for PieChartXBlock. */
function PieChartXBlock(runtime, element) {

    /* Html element that is used to display error messages */
    $('.xblock-editor-error-message', element).html();
    $('.xblock-editor-error-message', element).css('display', 'none');

    /* variables used to draw a Pie Chart */
    var donut, showLabels, labelType, labelThreshold, width, height, startangle, endangle, data;
    
    /* Ajax call that gets Pie Chart data from the server */
    $.ajax({
        type: "POST",
        url: runtime.handlerUrl(element, 'send_Data'),
        data: JSON.stringify({requested: true}),
        success: function(result) {
            donut = JSON.parse(result.donut);
            showLabels = JSON.parse(result.showLabels);
            labelType = result.labelType;
            labelThreshold = result.labelThreshold;
            width = result.width;
            height = result.height;
            startAngle = result.startAngle;
            endAngle = result.endAngle;
            data = JSON.parse(result.groups);
            
            var angleRatio = Math.abs((endAngle - startAngle) / 360);
            var angleOffset = startAngle * Math.PI / 180;
            
            /* This function draws a pie chart from variable data */
            nv.addGraph(function() {
                var chart = nv.models.pieChart()
                    .x(function(d) { return d.groupName })
                    .y(function(d) { return d.groupValue })
                    .color(d3.scale.category10().range())
                    .showLabels(showLabels)         //Display pie labels
                    .labelType(labelType)           //Configure what type of data to show in the label. Can be "key", "value" or "percent"
                    .labelThreshold(labelThreshold) //Configure the minimum slice size for labels to show up
                    .donut(donut)                   //Turn on Donut mode. Makes pie chart look tasty!
                    .width(width)
                    .height(height);
                
                chart.pie
                    .startAngle(function(d) { return d.startAngle*angleRatio - (Math.PI/2 - angleOffset) })
                    .endAngle(function(d) { return d.endAngle*angleRatio - (Math.PI/2 - angleOffset) });
                
                
                //Pie chart data. There is only a single array of key-value pairs.
                d3.select($('#chart',element).get(0))
                    .datum(data)
                    .transition().duration(1200)
                    .attr('width', width)
                    .attr('height', height)
                    .call(chart);

                chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

                return chart;
            });
        }
    });

    $(function ($) {
        /* Here's where you'd do things on page load. */
    });
}

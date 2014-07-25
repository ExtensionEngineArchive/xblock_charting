/* Javascript for PieChartXBlock. */
function PieChartXBlock(runtime, element) {

    /* flag indicating whether a regular or donut chart will be shown */
    var donut = JSON.parse($('#donut', element).val().toLowerCase());
    
    /* flag indicating whether labels will be shown or not */
    var showLabels = JSON.parse($('#showLabels', element).val().toLowerCase());
    
    /* type of label display */
    var labelType = $('#labelType', element).val();
    
    /* label threshold */
    var labelThreshold = $('#labelThreshold', element).val();
    
    /* width and height of the Pie Chart */
    var width = $('#width', element).val();
    var height = $('#height', element).val();
    
    /* start and end angles of the Pie Chart */
    var startAngle = $('#startAngle', element).val();
    var endAngle = $('#endAngle', element).val();
    var angleRatio = Math.abs((endAngle - startAngle) / 360);
    var angleOffset = startAngle * Math.PI / 180;

    /* data sent from the database */
    var data = $.parseJSON($('#groups', element).val().replace(/\'/g, '"'));

    /* Html element that is used to display error messages */
    $('.xblock-editor-error-message', element).html();
    $('.xblock-editor-error-message', element).css('display', 'none');

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

    $(function ($) {
        /* Here's where you'd do things on page load. */
    });
}

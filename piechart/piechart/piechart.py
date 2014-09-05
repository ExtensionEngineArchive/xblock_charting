"""PieChartXBlock is a type of presentational XBlock, 
where students are able to visualize data on a pie chart 
and even interact with it."""

import pkg_resources

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String, List, Boolean, Float
from xblock.fragment import Fragment
from django.template import Context, Template

class PieChartXBlock(XBlock):

    display_name = String(display_name="Display Name",
                          default="Pie Chart",
                          scope=Scope.settings,
                          help="Name of the component in the edX platform")
    
    groupNames = List(display_name="Group Names",
                      default=[u"Group 1", u"Group 2", u"Group 3"],
                      scope=Scope.content,
                      help="Names of available groups")
                      
    groupValues = List(display_name="Group Values",
                       default=[100, 200, 300],
                       scope=Scope.content,
                       help="Values of available groups")
    
    showLabels = Boolean(display_name="Show Labels",
                         default=True,
                         scope=Scope.content,
                         help="Flag indicating whether students will see the labels on the pie chart or not")
    
    labelThreshold = Integer(display_name="Label Threshold",
                             default=0,
                             scope=Scope.content,
                             help="Only groups with percent above the set threshold will have visible labels")
                             
    donut = Boolean(display_name="Donut",
                    default=False,
                    scope=Scope.content,
                    help="Flag indicating whether the pie chart is regular or donut chart")
                    
    width = Integer(display_name="Width",
                    default=500,
                    scope=Scope.content,
                    help="Width of the pie chart")
                    
    height = Integer(display_name="Height",
                     default=500,
                     scope=Scope.content,
                     help="Height of the pie chart")
                     
    startAngle = Integer(display_name="Start Angle",
                         default=0,
                         scope=Scope.content,
                         help="Start angle of the pie chart")

    endAngle = Integer(display_name="End Angle",
                       default=360,
                       scope=Scope.content,
                       help="End angle of the pie chart")
    
    # 0=Display Percents, 1=Display Group Names, 2=Display Group Values
    labelType = Integer(display_name="Type of Label Display",
                        default=0,
                        scope=Scope.content,
                        help="Type of label display")
                        
    labelTypes = ["Percent", "Group Name", "Group Value"]

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        """
        The primary view of the PieChartXBlock, shown to students
        when viewing courses.
        """
        html_charts = self.resource_string("static/html/piechart.html")
        template = Template(html_charts)
        
        #parameters sent to browser for XBlock html page
        html = template.render(Context({
        }))
        
        frag = Fragment(html)
        #adding references to external css and js files
        frag.add_css(self.resource_string("static/css/piechart.css"))
        frag.add_css(self.resource_string("static/css/nv.d3.css"))
        frag.add_javascript(self.resource_string("static/js/lib/d3.v3.js"))
        frag.add_javascript(self.resource_string("static/js/lib/nv.d3.min.js"))        
        frag.add_javascript(self.resource_string("static/js/lib/nv.d3.js"))      
        frag.add_javascript(self.resource_string("static/js/lib/utils.js"))
        frag.add_javascript(self.resource_string("static/js/lib/legend.js"))
        frag.add_javascript(self.resource_string("static/js/lib/pie.js"))
        frag.add_javascript(self.resource_string("static/js/lib/pieChart.js"))
        
        frag.add_javascript(self.resource_string("static/js/src/piechart.js"))
        frag.initialize_js('PieChartXBlock')
        return frag
    
    def studio_view(self, context=None):
        """
        The primary view of the PieChartXBlock, shown to teachers
        when editing the block.
        """
        html_edit_chart = self.resource_string("static/html/piechart_edit.html")
        template = Template(html_edit_chart)
        
        #merge group names and group values for easier iteration in Django template
        groups = [[name, value] for name, value in zip(self.groupNames, self.groupValues)]
        
        #parameters sent to browser for edit html page
        html = template.render(Context({
            'display_name': self.display_name,
            'lengrp': len(self.groupNames),
            'groups': groups,
            'showLabels': self.showLabels,
            'labelType': self.labelType, #current label type
            'labelTypes': self.labelTypes, #list of all available label types
            'labelThreshold': self.labelThreshold,
            'donut': self.donut,
            'width': self.width,
            'height': self.height,
            'startAngle': self.startAngle,
            'endAngle': self.endAngle
        }))

        frag = Fragment(html.format(self=self))
        #adding references to external css and js files
        frag.add_css(self.resource_string("static/css/piechart_edit.css"))
        frag.add_javascript(self.resource_string("static/js/src/piechart_edit.js"))
        frag.initialize_js('PieChartXBlockEdit')
        return frag
    
    @XBlock.json_handler
    def save_Charts(self, data, suffix=''):
        """
        Handler which saves the json data into XBlock fields.
        """
        self.display_name = data['display_name']
        self.groupNames = data['groupNames']
        self.groupValues = data['groupValues']
        self.showLabels = data['showLabels']
        self.labelType = data['labelType']
        self.labelThreshold = data['labelThreshold']
        self.donut = data['donut']
        self.width = data['width']
        self.height = data['height']
        self.startAngle = data['startAngle']
        self.endAngle = data['endAngle']

        return {
            'result': 'success',
        }
        
    @XBlock.json_handler
    def send_Data(self, data, suffix=''):
        """
        Handler which sends Pie Chart data back to the javascript
        """
        
        #getting expected labelType input string for nvd3 chart function
        if self.labelType == 0:
            labelType = "percent"
        elif self.labelType == 2:
            labelType = "value"
        else:
            #in case of 1 or other unexpected value of labelType, group name will be shown
            labelType = "key"
            
        #creating json string from groupNames and groupValues lists
        groups = [{"groupName":str(name), "groupValue":value} for name, value in zip(self.groupNames, self.groupValues)]

        return {
            'result': 'success',
            'donut': str(self.donut).lower(),
            'showLabels': str(self.showLabels).lower(),
            'labelType': labelType,
            'labelThreshold': float(self.labelThreshold)/100,
            'width': self.width,
            'height': self.height,
            'startAngle': self.startAngle,
            'endAngle': self.endAngle,
            'groups': str(groups).replace("\'", "\""),
        }

    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("PieChartXBlock",
             """<vertical_demo>
                <piechart/>
                </vertical_demo>
             """),
        ]

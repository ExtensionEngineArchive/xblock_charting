/* Javascript for ChartsXBlock, edit view. */
function PieChartXBlockEdit(runtime, element) {
    
    /* Html element used to alert users, in case of an error */
    $('.xblock-editor-error-message', element).html();
    $('.xblock-editor-error-message', element).css('display', 'none');
    $('.xblock-editor-error-message', element).css('color', 'red');

    /* Click event for Cancel button, while in the edit mode */
    $(element).find('.cancel-button').bind('click', function() {
        runtime.notify('cancel', {});
    });

    /* Click event for Save button, while in the edit mode */
    /* Gets all the input values and sends them back to model */
    $(element).find('.save-button').bind('click', function() {
        
        /* Get groups */
        groupNames = [];
        groupValues = [];
        nGroups = $(element).find('input[id=edit_groups]').val();
        
        var name, value;
        
        for (var i=1;i<=nGroups;i++){
            name = $(element).find('input[name=group'+i+'_name]').val();
            value = $(element).find('input[name=group'+i+'_value]').val();
            groupNames.push(name);
            groupValues.push(parseFloat(value));
        }
        
        /* Data for the model */
        var data = {
            'display_name': $('.edit-display-name', element).val(),
            'groupNames': groupNames,
            'groupValues': groupValues,
            'showLabels': $('.edit-show-labels', element).is(':checked'),
            'labelType': $(element).find('select.edit-label_type > option:selected ').val(),
            'labelThreshold': $(element).find('input[id=edit_label_threshold]').val()|0,
            'donut': $('.edit-donut', element).is(':checked'),
            'width': $('.edit-width', element).val()|0,
            'height': $('.edit-height', element).val()|0,
            'startAngle': $('.edit-start-angle', element).val()|0,
            'endAngle': $('.edit-end-angle', element).val()|0
        };
        
        /* AJAX call and its handler */
        var handlerUrl = runtime.handlerUrl(element, 'save_Charts');
        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
            if (response.result === 'success') {
                window.location.reload(true);
            } else {
                $('.xblock-editor-error-message', element).html('Error: '+response.message);
                $('.xblock-editor-error-message', element).css('display', 'block');
            }
        });
    });
    
    /* Validates user input for group values */
    $(element).on('keyup', 'input.group-value', function(){
        ValidateTextData(this, element, "Group value", 0);
    });
    
    /* Validates user input for Pie chart width */
    $(element).on('keyup', 'input#edit_width', function(){
        ValidateTextData(this, element, "Width", 500);
    });
    
    /* Validates user input for Pie chart height */
    $(element).on('keyup', 'input#edit_height', function(){
        ValidateTextData(this, element, "Height", 500);
    });
    
    /* Validates user input for Pie chart start angle */
    $(element).on('keyup', 'input#edit_start_angle', function(){
        ValidateNumericData(this, element, "Start angle", 0, 360);
    });
    
    /* Validates user input for Pie chart end angle */
    $(element).on('keyup', 'input#edit_end_angle', function(){
        ValidateNumericData(this, element, "End angle", 0, 360);
    });
    
    /* Check the validity of data in text box for editing label threshold 
       when user chooses to enter the data from keyboard */
    $(element).on('keyup', 'input#edit_label_threshold', function(){
        ValidateNumericData(this, element, "Label threshold", 0, 100);
    });
    
    /* Check the validity of data in text box for editing number of available groups 
       when user chooses to enter the data from keyboard */
    $(element).on('keyup', 'input#edit_groups', function(){
        ValidateNumericData(this, element, "Number of groups", 2, 10);
        GenerateDynamicInputs(element, this);
    });
    
    /* Dynamically recreates html text inputs for groups in case user chooses to interact with the control using up and down buttons */
    $(element).on('change', 'input#edit_groups', function(){
        GenerateDynamicInputs(element, this);
    });
    
    /* 
        Validates data entered within text html input field
        Parameters: -validated html input element
                    -XBlock element sent from server side
                    -description name of the validated element
                    -minimum value
    */
    function ValidateTextData(textElement, element, name, minValue) {
        var txtValue = $(textElement).val();
        if (isNaN( txtValue )){
            $(textElement).val(minValue);
            $('.xblock-editor-error-message', element).html(name + ' must be a number.');
            $('.xblock-editor-error-message', element).css('display', 'block');
        }
        else if (txtValue < 0){
            $(textElement).val(txtValue.substring(1));
            $('.xblock-editor-error-message', element).html(name + ' must be a positive number.');
            $('.xblock-editor-error-message', element).css('display', 'block');
        }
        else {
            $('.xblock-editor-error-message', element).html();
            $('.xblock-editor-error-message', element).css('display', 'none');    
        }
    }
    
    /* 
        Validates data entered within numeric html input field
        Parameters: -validated html input element
                    -XBlock element sent from server side
                    -description name of the validated element
                    -minimum value
                    -maximum value
    */
    function ValidateNumericData(numericElement, element, name, minValue, maxValue) {
        var nmbValue = $(numericElement).val();
        
        if (nmbValue < minValue) {
            $('.xblock-editor-error-message', element).html(name + ' must be a positive number.');
            $('.xblock-editor-error-message', element).css('display', 'block');
            nmbValue = minValue;
        } else if (nmbValue > maxValue) {
            $('.xblock-editor-error-message', element).html('Maximum ' + name.toLowerCase() + ' is ' + maxValue + '.');
            $('.xblock-editor-error-message', element).css('display', 'block');
            nmbValue = maxValue;
        } else {
            $('.xblock-editor-error-message', element).css('display', 'none');
        }
        
        $(numericElement).val(nmbValue);
    }
    
    /* Generates label and inputs for each group, depending on the entered number of available groups */
    function GenerateDynamicInputs(element, groupElement) {
        var nGroups = $(groupElement).val();

        var html_String = "<label class='label setting-label'>Group</label><label class='label setting-label' id='name'>Name</label><label class='label setting-label' id='value'>Value</label><span class='tip setting-help'>Name example: Male<br/>Value example: 54.1</span>";
        var name, value;
        
        for (var i=1;i<=nGroups;i++){
            
            name = $(element).find('input[name=group'+i+'_name]').val();
            value = $(element).find('input[name=group'+i+'_value]').val();
            
            if (name == null){
                html_String += "<p><label class='label setting-label'>Group "+i+"</label><input style='margin-left: 4px;' class='input setting-input group-name' name='group"+i+"_name' id='group"+i+"_name' value='Group "+i+"' type='text'>";
            }
            else{
                html_String += "<p><label class='label setting-label'>Group "+i+"</label><input style='margin-left: 4px;' class='input setting-input group-name' name='group"+i+"_name' id='group"+i+"_name' value='"+name+"' type='text'>";          
            }
            
            if (value == null){
                html_String += "<input style='margin-left: 4px;' class='input setting-input group-value' name='group"+i+"_value' id='group"+i+"_value' value='' type='text'></p>";
            }
            else{
                html_String += "<input style='margin-left: 4px;' class='input setting-input group-value' name='group"+i+"_value' id='group"+i+"_value' value='"+value+"' type='text'></p>";
            }
        }

        $("#panel2", element).html(html_String);
    }
    
    $(function () {
        /* Here's where you'd do things on page load. */
    });
}

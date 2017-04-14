/*
 * Test problem
 */

window.ALPHAMOD = window.ALPHAMOD || {};

(function(aMod)
{
    "use strict";
    
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // dynamically build month names for month selector
    // month names could be more easily localized since 
    // the month names come from a single source
    // Date.toLocaleDateString() could be used for a limited set of browsers

    aMod.setMonthSelector = function($monthSelector)
    {
        var monthDomFrag = document.createDocumentFragment();
        var $option;
    
        for (var i = 0; i < 12; i++)
        {
            $option = $('<option value="' + i + '">' + months[i] + '</option>');
            monthDomFrag.appendChild($option.get(0));
        }
    
        $monthSelector.append(monthDomFrag);
    };

   // get the schedules and add them to the web page

    aMod.displaySchedules = function($scheduleSelector)
    {
        var classDomFrag = document.createDocumentFragment();

        // The data is stubbed for testing purposes.
        // TODO: Get data via AJAX call.
        // TODO? Convert JSON data to model data using MVC framework like Backbone.js

        if (!window.data || !window.data.schedule || !window.data.schedule.length === 0)
        {
            showError("errorSchedule", "No classes currently available. Please check back later.");
            return;
        }
        else
        {
            hideAndClearErrors();
        }

        // Convert the class schedule data to HTML
    
        classDomFrag = getScheduleData(window.data, classDomFrag);

        // Render the class schedules on the page

        $(classDomFrag).insertAfter( $scheduleSelector.find(".fieldsTitle") );
    };
    
    // get the scheduls from the JSON data

    function getScheduleData(data, classDomFrag)
    {
        var $row;
        var checkbox;
        var scheduleCount = data.schedule.length;
        var area, classX, id, daysMonths, dateRange;
        var scheduleData;
        var classes = [];
        var classCount;
        var gotClass = false;
    
        for (var i = 0; i < scheduleCount; i++)
        {
           scheduleData = data.schedule[i];
           area = scheduleData.area;
           classes = scheduleData.class;
           classCount = classes.length;
        
           $row = getScheduleRow(" ", area, "studyTitle");
           classDomFrag.appendChild($row.get(0));
        
            if (classes && classCount > 0)
            {
                gotClass = true;
            
                for (var j = 0; j < classCount; j++)
                {
                    classX = classes[j];
                    id = classX.id;
                    daysMonths = classX.startMo + "," + classX.startDy + "," + classX.endMo + "," + classX.endDy;
                    checkbox = '<input type="checkbox" class="classCheck" id="' + id + '" name="' + id;
                    checkbox += '" value="' + daysMonths + '" />';
                
                    dateRange = getDateRange(classX);
                
                    $row = getScheduleRow(checkbox, "Class " + (j + 1) + ": " + dateRange);
                    classDomFrag.appendChild($row.get(0));
                }
            }        
        }
    
        if (!gotClass)
        {
            showError("errorSchedule", "Error: No classes found.");
        }
        else
        {
            hideAndClearErrors();
        }
    
        return classDomFrag;
    }

    // get formated date range

    function getDateRange(classX)
    {
        var startDateFormatted, endDateFormatted;

        startDateFormatted = months[classX.startMo] + " " + classX.startDy;
        endDateFormatted = months[classX.endMo] + " " + classX.endDy;

        return startDateFormatted + " to " + endDateFormatted;
    }
    
     // Create a single class schedule row
     // Can also create the title row with the study area
     // TODO? Convert jQuery DOM fragments to templates (e.g. Handlebars)

     function getScheduleRow(col1Val, col2Val, col2Class)
    {
        var $row = $('<div class="flexrow"></div>');
        var $col1 = $('<div class="flexcol1">' + col1Val + '</div>');
        var $labelCol2 = $('<span>' + col2Val + '</span>');
        var $col2 = $('<div class="flexcol2"></div>');
      
        if (col2Class)
        {
            $labelCol2.addClass(col2Class);
        }
    
        $col2.append($labelCol2);
        $row.append($col1);
        $row.append($col2);
      
        return $row;
    }

    function showError(errorSelector, mess)
    {
        var $errorContainer = $("#" + errorSelector);
    
        $errorContainer.append(mess);
        $errorContainer.show();
        $("#generalErrorMess").text("Form error occurred. Please check all fields for errors.").show();
    }

    function hideAndClearErrors()
    {
        $("#errorPersonal").hide().text("");
        $("#errorSchedule").hide().text("");
        $("#generalErrorMess").hide().text("");    }
    
    function setBirthday()
    {
        var y1000 = parseInt( $("#bdayYear1").val(), 10);
        var y100 = parseInt( $("#bdayYear2").val(), 10);
        var y10 = parseInt( $("#bdayYear3").val(), 10);
        var y1 = parseInt( $("#bdayYear4").val(), 10);
        
        aMod.bYear = y1000 + y100 + y10 + y1;
        aMod.bMonth = parseInt( $("#bdayMonth").val(), 10);
        aMod.bDay = parseInt( $("#bdayDay").val() , 10);
    }
    
    function setClassSchedules()
    {
        var $classes = $(".classCheck:checked");
        var classCount = $classes.length;
        var classSchedules = [];
        
        for (var i = 0; i < classCount; i++)
        {
            classSchedules.push($classes.eq(i).attr("id"));
        }
        
        aMod.schedule = classSchedules;
    }
    
    // Initial form submittal
    // handles client-side validation and confirmation page
    
    aMod.handleInitialSubmittal = function(event)
    {
        hideAndClearErrors();

        aMod.name = $("#name").val();
        aMod.email = $("#email").val();
        setBirthday();
        setClassSchedules();
        
        if (validateAll())
        {
            showConfirmation();
        }
        
        event.preventDefault();
    };
    
    // display submitted values for confirmation
    
    function showConfirmation()
    {
        var $confirmPage = $("#confirmation");
    
        $("#mainForm").hide();

        // create JSON from input field values
        // display confirmation page from JSON
        
        var jsonRequest = 
        {
            "name": aMod.name,
            "email": aMod.email,
            "bDay": aMod.bDay,
            "bMonth": aMod.bMonth + 1,
            "bYear": aMod.bYear,
            "schedule": aMod.schedule
        };
        
        var stringRequest = JSON.stringify(jsonRequest);
        var $json = $("#jsonRequest");
        var $formPersonal = $("#formattedPersonal");
        var $formSchedule = $("#formattedSchedule");
        
        var id, area, classNumber;
        
        $json.text(stringRequest);
        $formPersonal.append("<p>Full Name: " + aMod.name + "</p>");
        $formPersonal.append("<p>Email: " + aMod.email + "</p>");
        $formPersonal.append("<p>Birthday: " + months[aMod.bMonth] + " " + aMod.bDay + ", " + aMod.bYear + "</p>");

        for (var i = 0; i < aMod.schedule.length; i++)
        {
            id = aMod.schedule[i];
            area = id.match(/[^0-9]+/)[0];
            classNumber = id.match(/[0-9]+$/)[0];
            $formSchedule.append("<p>" + area + " Class " + classNumber + "</p>");
        }
        
        $confirmPage.show();
        
        $("#confirmSubmit").click({param1: jsonRequest}, confirmSubmit);
        $("#cancelSubmit").click(cancelSubmit);
    }
    
    // validation functions
    
    var validateRequiredFields = function(errors)
    {
        var requiredFields = ["name", "email"];
    
        for (var i = 0; i < requiredFields.length; i++)
        {
            if ($("#" + requiredFields[i]).val() === "")
            {
                errors.push("<p>" + requiredFields[i] + " must not be blank</p>");
            }
        }
        
        return errors;
    }
    
    var validateName = function(errors)
    {
        var name = aMod.name;
        
        if (name.match(/^[a-zA-Z]+\s{1}[a-zA-Z]+$/) === null)
        {
            errors.push("<p>name field requires a first and last name separated by a space</p>");
        }
        
        return errors;
    }
    
    // with more time, it would be better to implement a state engine to parse
    // the address one character at a time using RFC grammar rules
    
    var validateEmail = function(errors)
    {
        var email = aMod.email;
        
        if (email.match(/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/) === null)
        {
            errors.push("<p>please check the email address format</p>");
        }
        
        return errors;
    }
    
    var validateBirthday = function(errors)
    {
        var birthYear;
        var birthMonth;
        var birthDay;
        var maxDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var isLeapYear = ((birthYear % 4 === 0) && (birthYear % 100 !== 0)) || (birthYear % 400 === 0);
        var aDate = new Date();
        var currentYear = aDate.getFullYear();
        var currentMonth = aDate.getMonth();
        var currentDay = aDate.getDate();
        
        birthYear = aMod.bYear;
        birthMonth = aMod.bMonth;
        birthDay = aMod.bDay;
        
        if (isLeapYear)
        {
            maxDays[1] = 29;
        }
        
        if (birthDay > maxDays[birthMonth])
        {
            errors.push("<p>illegal day for the month</p>");
        }
        
        if (birthMonth >= currentMonth && birthDay > currentDay)
        {
            if (birthYear >= (currentYear - 16))
            {
                errors.push("<p>must be at least 16-years-old to apply</p>");
            }
            
            if (birthYear >= currentYear)
            {
                errors.push("<p>birthday can't be in the future</p>");
            }
        }
        
        return errors;
    }
    
    var validateClassSelection = function(errors)
    {
        if ($(".classCheck:checked").length === 0)
        {
            errors.push("<p>at least one class must be selected</p>");
        }
        
        return errors;
    }
    
    var validateNoOverlappingClasses = function(errors)
    {
        var $classes = $(".classCheck:checked");
        var classCount = $classes.length;
        var classDates = [];
        var startMonth, startDay, endMonth, endDay;
        var startDate1, startDate2, endDate1, endDate2;
        var currentYear = new Date().getFullYear();
        var year = currentYear;
        var foundOverlap = false;

        if (classCount < 2)
        {
            return errors;
        }
        
        for (var i = 0; i < classCount; i++)
        {
            classDates = $classes.eq(i).val().split(",");
            
            startMonth = parseInt(classDates[0] , 10);
            startDay = parseInt(classDates[1], 10);
            startDate1 = new Date(currentYear, startMonth, startDay, 0, 0, 0, 0);
            
            endMonth = parseInt(classDates[2], 10);
            endDay = parseInt(classDates[3], 10);
            
            if (endMonth < startMonth)
            {
                year = currentYear + 1; 
            }

            endDate1 = new Date(year, endMonth, endDay, 0, 0, 0);
            
            for (var j = (i + 1); j < classCount; j++)
            {
                classDates = $classes.eq(j).val().split(",");
                
                startMonth = parseInt(classDates[0] , 10);
                startDay = parseInt(classDates[1], 10);
                startDate2 = new Date(currentYear, startMonth, startDay, 0, 0, 0, 0);
                
                endMonth = parseInt(classDates[2], 10);
                endDay = parseInt(classDates[3], 10);

                if (endMonth < startMonth)
                {
                    year = currentYear + 1; 
                }

                endDate2 = new Date(year, endMonth, endDay, 0, 0, 0);

                if (startDate1.getTime() >= startDate2.getTime()
                 && startDate1.getTime() <= endDate2.getTime())
                {
                    foundOverlap = true;
                    break;
                }
                
                if (endDate1.getTime() >= startDate2.getTime() 
                 && endDate1.getTime() <= endDate2.getTime())
                {
                    foundOverlap = true;
                    break;
                }
            }
            
            if (foundOverlap)
            {
                errors.push("<p>overlapping classes aren't allowed</p>");
                break;
            }
        }
        
        return errors;
    }
    
    // handle all client-side form validation
    
    function validateAll()
    {
        var errors = [];
        var isValid = true, index;
        var personalValidation = [validateRequiredFields, validateName, validateEmail, validateBirthday];
        var scheduleValidation = [validateClassSelection, validateNoOverlappingClasses];

        for (index = 0; index < personalValidation.length; index++)
        {
            errors = personalValidation[index](errors);
            
            if (errors.length > 0)
            {
                showError("errorPersonal", errors.join(""));
                isValid = false;
                errors = [];  // clear for each validation
            }
        }
        
        for (index = 0; index < scheduleValidation.length; index++)
        {
            errors = scheduleValidation[index](errors);
        
            if (errors.length > 0)
            {
                showError("errorSchedule", errors.join(""));
                isValid = false;
                errors = [];  // clear for each validation
            }
        }
        
        return isValid;
    }
    
    // allow confirmation page to be submitted
    // TODO? Make functional with a form action and 
    //       target web page - show message for now
    
    function confirmSubmit(event)
    {
        // submit using jQuery AJAX with the JSON request data and data type json
        
        var json = event.data.param1;
        
        // window.console.log( JSON.stringify(json) );  // confirmed that json request is passed
        
        $("#confirmation").hide();
        $("#submitMess").show();
    }
    
    function cancelSubmit()
    {
        $("#confirmation").hide();
        $("#mainForm").show();
        
        $("#jsonRequest").html("");
        $("#formattedPersonal").html("");
        $("#formattedSchedule").html("");
    }

})(ALPHAMOD);

// Web page control

(function(aMod)
{
    "use strict";

    var $monthSelector = $("#bdayMonth");
    var $scheduleSelector = $("#scheduleFields");

    aMod.setMonthSelector($monthSelector);
    aMod.displaySchedules($scheduleSelector);
    
    $("#mainSubmit").click(aMod.handleInitialSubmittal);

})(ALPHAMOD);

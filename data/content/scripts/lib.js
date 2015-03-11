// Calculate average APS from a student list
function getAvgAPS (data) {
    
    var averageAPS = 0.0;
    var total = 0.0;

    // Loop through list, if an APS exists, add to total
    for (var i = 0; i < data.length; i++) {
        if(data[i].aps > 0){
            total += parseFloat(data[i].aps);
        };
    };

    // Calculate average APS
    averageAPS = total / data.length;

    return averageAPS;
};

// Get total UCAS points from provided list of grades, a json object containing ucas points by grade and course type
function getTotalActualUCAS (data, ucas, crstype) {

    var totalUCAS = 0;

    // Loop through our list of grades
    for (var i = 0; i < data.length; i++) {
        // Just to make the next bit cleaner to read
        var thegrade = data[i].value.trim();

        // If grade contains slash it is combined grade and must be adjusted via the getGradeFromHalfGrade function!
        if(thegrade.indexOf("/") !== -1){
            thegrade = getGradeFromHalfGrade(thegrade, crstype);
        };

        // Loop through the ucas lookup table and find the corresponding ucas points for the grade
        for (var x = 0; x < ucas.length; x++) {
            if((thegrade.trim()!="")&&(thegrade.trim()==ucas[x].grade.trim() || thegrade.trim()==ucas[x].altgrade.trim())
                && ucas[x].type.trim() == crstype.trim()) {
                //alert("Match: "+ data[i].name + thegrade + " " + ucas[x].grade + " " + ucas[x].points + " " + totalUCAS)
                totalUCAS += parseInt(ucas[x].points);
            };
        };
    };

    return totalUCAS;
};

// Get predicted ucas from APS scores, pointbands gives a grade for particular aps and crstype
function getTotalPredUCAS (data, pointbands, crstype) {

   var totalPredUCAS = 0.0;

   // Loops through list of students
   for (var i = 0; i < data.length; i++) {

       // Loop through the lookup
        for(var x = 0;x < pointbands.length;x++){

            // If the student APS is between the two values then add the ucas points to the total
            if(data[i].aps < pointbands[x].apsh 
                && data[i].aps >= pointbands[x].apsl 
                && pointbands[x].type == crstype
                ){
                //alert(pointbands[x].apsh + " " + pointbands[x].apsl + " " + crstype);
                totalPredUCAS += parseFloat(pointbands[x].bmark);
            };
        };
    };

    return totalPredUCAS;
};

// Count number of valid students to include in calcs
function getNumValidStudents (data, table){

    var numValidStudents = 0;

    // if APS exists then valid
    for (var i = 0; i < data.length; i++) {
        if(data[i].aps > 0){
            numValidStudents++;
        };
    };

    // if no grade supplied then subtract
    for (var i = 0; i < table.length; i++) {
        if(table[i].value.trim() == ''){
            numValidStudents--;
        };
    };

    return numValidStudents;
};

// Calculate alps
function getALPSscore (totalActualUCAS, totalPredUCAS, numStuds, crsType){

    var ALPSscore = 0.0;

    // Set the weighting according to course type, should probably be a json file
    var multiplier = 0;
    switch(crsType)
    {
        case 'AS'://'AS','50'
          multiplier = 50;
          break;
        case 'AS E'://'AS E','50'
          multiplier = 50;
          break;
        case 'AS S'://'AS S','50'
          multiplier = 50;
          break;
        case 'AS D'://'AS D','100'
          multiplier = 50;
          break;
        case 'A2'://'A2','100'
          multiplier = 100;
          break;
        case 'A2 S'://'A2 S','100'
          multiplier = 100;
          break;
        case 'A2 D'://'A2 D','200'
          multiplier = 200;
          break;
        case 'NATAW'://'NATAW','100'
          multiplier = 100;
          break;
        case 'NCERT'://'NCERT','200'
          multiplier = 200;
          break;
        case 'NDIP'://'NDIP','300'
          multiplier = 300;
          break;
        case 'OCRCER'://'OCRCER','100'
          multiplier = 100;
          break;
        case 'OCRDIP'://'OCRDIP','200'
          multiplier = 200;
          break;
        case 'QCERT'://'QCERT','50'
          multiplier = 50;
          break;
        case 'QDIP'://'QDIP','200'
          multiplier = 200;
          break;
        case 'QSDP'://'QSDP','100'
          multiplier = 100;
          break;
        default:
          multiplier = 0;
    }

    // ALPS calculation
    ALPSscore = ((totalActualUCAS-totalPredUCAS)/(numStuds*multiplier))+1;

    return ALPSscore;
};

// Function to ge the right bit from a combined grade
function getGradeFromHalfGrade (thegrade,crstype){

    // If A2 then get the higher grade (first bit), otherwise get the lower grade
    if(crstype.indexOf("A2")  !== -1){
        thegrade = thegrade.substring(0,thegrade.indexOf("/"));
    }
    else {
        thegrade = thegrade.substr(thegrade.indexOf("/")+1,thegrade.length-thegrade.indexOf("/"));
    };

    return thegrade;
};

// Function to draw the table on the page
function drawTable(students, gradelist, validgrades) {

    // Get course type from filtered list of students
    var crstype = students[0].type;

    // If OCR Diploma adjust grades to board style (P1, P2, P3)
    if(crstype == 'OCRDIP'){
        for (var i = 0; i < validgrades.length; i++){
            switch(validgrades[i].trim())  {
              case 'D2':
                validgrades[i] = 'D*D*';
              break; 
              case 'D':
                validgrades[i] = 'DD';
              break; 
              case 'M1':
                validgrades[i] = 'DM';
              break; 
              case 'M2':
                validgrades[i] = 'MM';
              break; 
              case 'P1':
                validgrades[i] = 'MM';
              break; 
              case 'P2':
                validgrades[i] = 'MP';
              break; 
              case 'P3':
                validgrades[i] = 'PP';
              break; 
            };
        };
    };

    //Remove all rows except first (thanks stackoverflow)
    $("#tableid").find("tr:gt(0)").remove();

    //Draw table
    $.each(students, function (i, item) {

        // Only include editable textbox if APS is there
        if (item.aps > 0) {
            var $tr = $('<tr style="text-align:center">').append(
                $('<td style="text-align:left">').text(item.studid)
                , $('<td style="text-align:left">').text(item.surname)
                , $('<td style="text-align:left">').text(item.forename)
                , $('<td>').text(item.aps)
                , $('<td>').text(item.target)
                , $('<td>').text(item.pgrade)
                , $('<td>').text(item.pgrade1)
                , $('<td>').text(item.pgrade2)
                , $('<td>').text(item.pgrade3)
                //, $('<td>').text(item.pgrade4)
                //, $('<td>').text(item.pgrade5)
                , $('<td>').html(buildSelect(validgrades, item.studid, gradelist[i], crstype))
                ).appendTo('#tableid');
        }
        else {
            var $tr = $('<tr>').append(
                $('<td style="text-align:center">').text(item.studid)
                , $('<td style="text-align:left">').text(item.surname)
                , $('<td style="text-align:left">').text(item.forename)
                , $('<td>').text(item.aps)
                , $('<td>').text(item.target)
                , $('<td>').text(item.pgrade)
                , $('<td>').text(item.pgrade1)
                , $('<td>').text(item.pgrade2)
                , $('<td>').text(item.pgrade3)
                //, $('<td>').text(item.pgrade4)
                //, $('<td>').text(item.pgrade5)
                , $('<td>').text("")
            ).appendTo('#tableid');
        }
    });
};

// For each row of the table build a select with valid options
function buildSelect(validgrades, studid, grade, crstype) {

    // Start building html
    var output = "<select name=" + studid + ">";
    output += "<option value=''>Select...</option>";

    // Loop through array of valid grades
    for(var i = 0; i < validgrades.length; i++){

        // Array for half grades problem
        var adjGrade = grade;

        // If half grade run the correction function
        if(grade.indexOf("/") !== -1){
            adjGrade = getGradeFromHalfGrade(grade, crstype);
        };

        // If the grade is the grade for this row, then select it
        if(validgrades[i]==adjGrade){
             output += "<option value='" + validgrades[i] + "' selected='selected'>" + validgrades[i] + "</option>";
        }
        else{
             output += "<option value='" + validgrades[i] + "'>" + validgrades[i] + "</option>";
        };
        
    };  
    
    // Finish off element and return
    output += "</select>";
    return output;
};

// Find the ALPS grade given an alps score and a lookup (alpsGrades)
function getALPSgrade(ALPSscore, alpsGrades, csid) {
    
    var ALPSgrade = 0;

    // Loop through the lookup
    for(var i = 0; i < alpsGrades.length;i++ ){

        // If course matches then find the highest band with the achieved score
        if(csid == alpsGrades[i].csid.trim()){
            if(ALPSscore > alpsGrades[i].bottom){ALPSgrade = 9;};
            if(ALPSscore > alpsGrades[i].p10){ALPSgrade = 8;};
            if(ALPSscore > alpsGrades[i].p25){ALPSgrade = 7;};
            if(ALPSscore > alpsGrades[i].p40){ALPSgrade = 6;};
            if(ALPSscore > alpsGrades[i].median){ALPSgrade = 5;};
            if(ALPSscore > alpsGrades[i].p60){ALPSgrade = 4;};
            if(ALPSscore > alpsGrades[i].p75){ALPSgrade = 3;};
            if(ALPSscore > alpsGrades[i].p90){ALPSgrade = 2;};
            if(ALPSscore > alpsGrades[i].top){ALPSgrade = 1;};
        };
    };
    return ALPSgrade;
};

// Function to filter allstudents into a particular course
function getFilteredStudentList(selectedcrs, data){

    var filteredData = new Array();

    // Loop through the big list and only add matching course rows to the returning array
    for (var i = 0; i < data.length; i++) {
        if (data[i].csid == selectedcrs) {
            filteredData.push(data[i]);
        };
    };

    return filteredData;
};
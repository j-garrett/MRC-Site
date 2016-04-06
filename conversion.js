$(document).ready(function(){

//delete any references/links to now out of date bibliographies
//find all <dd> nodes with "See separate bibliography"
//select node
//destroy!
(function(){
  $("dd:contains('See separate bibliography')").remove();
  //make sure no element is left behind to make extraneous table rows!
  $('dl').each(function() {
    var $this = $(this);
    if($this.html().replace(/\s|&nbsp;/g, '').length == 0)
        $this.remove();
  });
})();



//now concatenate multiple <dd> entries into a single <dd> entry with unordered lists!
//look at all <dl>
//if it has <dt> and 2+ <dd>
//turn second+ <dd> to unordered list
//nest unordered list inside first <dd>
( function() {
  var citEntry = $( 'dl' ).has( 'dt' ).each( function() {
    if ( $( this ).find( 'dd' ).length > 1 ) {
      var citEle = $( this );
      var citEleDD = citEle.find( 'dd' );
      citEleDD.not( ':first' ).replaceWith( function() {
        return $( '<li>', { html: $(this).html() } );
      });
      citEle.find( 'li' ).appendTo( citEleDD );
      citEleDD.find( 'li' ).wrap( '<ul>' );
    };
  });
})();
//best practice has scope set to function.
(function() {
  //Move <dd data-sortby="9" inside of list items:
  //find using data attribute and limit scope to <dl>
  //iterate over each result for scope purposes
  var element = $('dl').not( $( 'dl' ).has( 'dt' ) ).has('dd[data-sortby=9]').each(function(index) {
    var currEle = $(this);
    //find the <dl> that this additional cell needs to attach to
    //this keeps header related information safely out of the way
    var elementPrev = currEle.prev('dl');
    //lets look up and down this scope for any siblings that aren't <dl> and should be added into element. (<dl> implies it is a different citation. if the <dl> has the data-sortby it will still be grabbed by parent function)
    var sibPrev = currEle.prevUntil('dl');
    var sibNext = currEle.nextUntil('dl');
    //if previous is header then currEle can be deleted since we are only storing addtl info at the citation level
    if( sibPrev.is(':header') ) {
      currEle.remove();
    }else { //if previous is not a header or a dl, then it can be wrapped up in current element and concatenated.
      sibPrev.appendTo(currEle);
    };
    if( sibNext.is(':header') ) {
      //do nothing
    }else { //if previous is not a header or a dl, then it can be wrapped up in current element and concatenated.
      sibNext.appendTo(currEle);
    };
    //move the element into it's previous sibling. make sure it's nested in <dd> tag!
    //now the additional info is in the safety of the summary section!
    currEle.appendTo(elementPrev.children(':last'));
    //replace tags so it isn't later messed up by global tag replacement and broken out again!
    currEle.find('dd').replaceWith(function() {
      return $("<li>", {html: $(this).html()});
    });
    currEle.find('dt').replaceWith(function() {
      return $("<li>", {html: $(this).html()});
    });
    currEle.find('dl').replaceWith(function() {
      return $("<ul>", {html: $(this).html()});
    });
    currEle.replaceWith(function() {
      return $("<ul>", {html: $(this).html()});
    });
    //show change with color for troubleshooting
    elementPrev.css('background-color', 'red');
  });
})();



//NOW TURN CALL NUMBERS INTO PROPER LINKS!
(function(){
  //create variable for regular expression that finds all call numbers
  var callNumberSearch = new RegExp(/(BANC CD|Phonotape|Phonodisc|video\/c|video\/d|video|vhs|dvd|v\/c|sound\/c|sound\/d|s\/d|s\/c|compu\/d|MUSI CA)(\s|.?)(x|z|(999)|(mm)?)\s?:?(\s?)(\d{1,4})/ig);
  //turn DOM into array so you can iterate over it
  var elems = document.getElementsByTagName('dd');
  //convert NodeList of all <dd> elements to an Array so we can iterate through
  var elemArray = jQuery.makeArray(elems);
  //for each tag, grab element's HTML so you can replace call numbers with new html
  //iterate the code for each <dd> to find all call numbers
  $.each(elemArray,function(index, value){
    //create variable for current node's html
    var html = $(this).html();
    //create empty array that the for loop will add all call number links to
    //scope requires it be here
    var elemArray = [];
    //make looping variable out here to save slightly on memory usage
    var i = '';
    //Search for call number using regex and turn result into usable variable
    //test if there was a match before attempting the rest. this saves from erroring out if no match.
    if (html.match(callNumberSearch)){
      var callNumbersArray = html.match(callNumberSearch);
      //callNumber is smooshing the array into string. we need to perform this business below for EACH element
      //tried to do .each, but it didn't work properly. Take a closer look at how array is formed
      for(i = 0; i < callNumbersArray.length ; i++){
        //the tricky part may be putting it BACK into the DOM after doing the work on each bit.
        //Look closer at Array.prototype.join() for building the array back up and returning to DOM after iterating
        var callNumber = callNumbersArray[i].toString();
        //Swap out that slash for %2F so the Video/C call numbers work in query Url
        var callNumberReplace1 = callNumber.replace('/', '%2F');
        //Swap out the space for a + for the same reasons
        var callNumberReplace2 = callNumberReplace1.replace(' ', '+');
        //Concatenate into URL
        var callNumberUrl = 'http://oskicat.berkeley.edu/search~S1?/e' + callNumberReplace2;
        //create replacement element with proper linking
        var newElem = 'Ѭ href="' + callNumberUrl + '">' + callNumber + 'Ж';
        //add created link to array that will be pushed to DOM after loop
        elemArray.push(newElem);
        //join array so it's nice and pretty
        //THIS WILL NEED TO CHANGE TO PROPER DELIMITER?
        var newCallElem = elemArray.join(', ');
      }
      //delete call numbers in <dd>
      $(this).html(html.replace(callNumberSearch, ''));
      //once array is built we can THEN push it back into DOM
      //we will add it as a new element so it can be properly linked and delimited for csv transfer
      $(this).append('</dd><dd>'+newCallElem+'</dd>');
    }
  });
})();

  //use jQuery to add metadata
  $('dl').each(function(i){ //each <dt> will look up the dom for previous header elements so they can be added to the <dt>'s metadata
      //LINTED HTML turned everything into individual lists so now we search using <dl> as base element.
      for (var i = 0 ; i <=3 ; i++){ //loop through h1 - h3 elements using i variable to increment header size
          var upToEl = 'h' + i; //selector argument for prevUntil()
          var returnEl = 'h' + ( i + 1 ); //filter argument for prevUntil()
          var metaAdd = $(this).prevUntil( upToEl , returnEl ).slice( 0 , 1 ).text(); //limit text added to only the closest header element
          if(metaAdd){ //check if there is a value to add so extra unique strings don't clutter
              $(this).append( '<dd>' + metaAdd + '</dd>' ); //add header and unique string for future delimiter sort
          }
      }
  });
//now that metadata has been added using the h tags, we need to wrap the page title, the head honcho h1 tag,
//into a dl and dt tag so it can be converted into table form.
  var pageTitle = $('body').find('h1').text();
  $('body').find('h1').replaceWith('<dl><dd>'+pageTitle+'</dd></dl>');


//Transform LISTS into TABLES for eventual export
  $('dl').replaceWith(function(){
    return $("<tr>", {html: $(this).html()});
  });
  $('dt').replaceWith(function(){
    return $("<td>", {html: $(this).html()});
  });
  $('dd').replaceWith(function(){
    return $("<td>", {html: $(this).html()});
  });

//Add everything to a table.
//Need to copy all items inside #dvData into a <table> (this should be pretty much the whole page...)
//first, get all of the children of #dvData and set it to a variable for later use
  var newTableContents = $('#dvData').html();
//delete all content in #dvData and add a table to it. this order keeps the content from being doubled
  $('#dvData').empty().append("<table>");
//now find the child table of #dvData and add all the content back into it so it is clean and will be ready for export
  $('#dvData')
  .find("table")
//adapt the current url into the static url and post it in for reference at csv review
  .prepend("<tr><td>Source:</td><td>"+window.location.pathname.replace("/03_jQuery-Test/","http://www.lib.berkeley.edu/MRC/")+"</td></tr>")
//add a final
  .append(newTableContents+"<tr><td>Export Successful and Complete</td></tr>");

//now add the export button to the top of the page!
$('body').prepend('<a href="#" class="export">Export Table data into Excel</a>');


});

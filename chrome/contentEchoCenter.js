var REQ = 0;
//recieve a message from the background.JS
chrome.extension.onMessage.addListener( processMessage );

/**
* A method used to process a message sent from the background task
*/
function processMessage(request, sender, sendResponse) {
	// Set ID
	var request_id = ++REQ;
	// get json data for lecture
	$.ajax({
        url: request.url,
        async: false,
        success: function(data) {
        	// Check for latest request before processing
        	if(request_id >= REQ){
            	processLecture(data.presentation, request.url, sendResponse);
        	}
        }            
    });
}

/**
* Process Json data and present links to user
*/
function processLecture(data, resource, sendResponse){
	// parse response
	var title = data.title;
	var uuid  = data.uuid;
	var date  = data.startTime;
	// TODO Get [vod|pod]cast link
	var vidLink = data.vodcast !== 'undefined';
	var audLink = data.podcast !== 'undefined';
	// Check casts exist
	if(!vidLink && !audLink){
		return;
	}
	// remove timezone from timestamp
	var tstamp = moment(date.replace( /([+-]\d{2}:\d{2}|Z)/i, ''));
	if(!tstamp.isValid()){
		return;
	}
	// grab meta data container to place download links
	var lectureMeta = $(".info-meta").last();	  
	// check that nothing went wrong
	if(lectureMeta == null){ 
		return;
	}
	// remove old links
	lectureMeta.empty();
	// get host URL
	var host = resource.split( /(ess|ecp)/ )[0];
	if(host == null){
		return;
	}
	// Media URL beginning
	var presentation = host + tstamp.format("[echocontent/]YYWW[/]E[/]") + uuid;
	// filename
	var fname = title + tstamp.format(" [-] MMM Do");
	// make URL to file
	var afile = presentation + "/audio.mp3";
	var vfile = presentation + "/audio-vga.m4v";
	// Check if valid, never versions use different extension
	if(!checkValid(vfile)){
		vfile = presentation + "/audio-video.m4v";
	}
	// generate DOM data
	var heading = $("<div class=\"info-key\">Downloads</div>");
	var aelement = makeLink(afile, fname, false);
	var velement = makeLink(vfile, fname, true);
	// append heading
	lectureMeta.append(heading);
	// append links
	if(vidLink && audLink){
		// Both links
		lectureMeta.append(aelement)
		.append($("<br />"))
		.append(velement);
	} else if (vidLink){
		// Video link only
		lectureMeta.append(velement);
	} else if (audLink){
		// Audio link only
		lectureMeta.append(aelement);
	}
	sendResponse();
}

/**
* Create link element
*/
function makeLink(href, fname, isVideo){
	// element
	var element = $("<div>");
	element.addClass("info-value");
	// anchor
	var anch = $("<a>");
	anch.attr('href', href);
	anch.attr('download', fname + ( isVideo ? ".m4v" : ".mp3" ));
	anch.attr('title', isVideo ? "Watch M4V Video or Screen File" : "Listen to MP3 Audio File" );
	anch.text( isVideo ? "Video File" : "Audio File" )
	// add anchor to element
	element.append(anch);
	return element;
}

/**
* Checks if a url is valid
*/ 
function checkValid(URL){
	var isValid;
	$.ajax({
        type: 'HEAD',
        url: URL,
        async: false,
        success: function() {
            isValid = true;
        },
        error: function() {
            isValid = false;
        }            
    });
    return isValid;
}
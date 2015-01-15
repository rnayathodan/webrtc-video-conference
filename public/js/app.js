var connection, signaler;
$( document ).ready(function() {
	//create a new connection
	connection = new RTCMultiConnection();

	//assign the container for local/remote videos
	connection.body = document.getElementById('videoContainer');
	var uniqid=new Date().valueOf();
	connection.userid="user-"+uniqid;

	// using reliable-signaler
	signaler = initReliableSignaler(connection, '/');

	connection.session = {
			audio: true,
			video: true,
			data: true
	};

	connection.sdpConstraints.mandatory = {
			OfferToReceiveAudio: true,
			OfferToReceiveVideo: true
	};

	var videoConstraints = {
			mandatory: {
					maxWidth: 640,
					maxHeight: 480,
					minAspectRatio: 1.77,
					minFrameRate: 3,
					maxFrameRate: 64
			},
			optional: []
	};

	var audioConstraints = {
			mandatory: {
					// echoCancellation: false,
					// googEchoCancellation: false, // disabling audio processing
					// googAutoGainControl: true,
					// googNoiseSuppression: true,
					// googHighpassFilter: true,
					// googTypingNoiseDetection: true,
					// googAudioMirroring: true
			},
			optional: []
	};

	connection.mediaConstraints = {
			video: videoConstraints,
			audio: audioConstraints
	};

	//Handle button Open
	$( "#open" ).click( function(){
    var sessionid = document.getElementById('session-id').value;
    if (sessionid.replace(/^\s+|\s+$/g, '').length <= 0) {
        alert('Please enter session-id');
        document.getElementById('session-id').focus();
        return;
    }

    //this.disabled = true;
		$(".main").addClass("hidden");
		$(".confRoom").removeClass("hidden");
		$(".owner").removeClass("hidden");
		$("#joinUrl").html(window.location.href+"?join="+sessionid);
		$("#roomName").html(sessionid);

    connection.channel = connection.sessionid = sessionid;
		//Create a new Room and connection
    connection.open({
        onMediaCaptured: function() {
            signaler.createNewRoomOnServer(connection.sessionid);
        }
    });

	});

	//handle button disconnect
	$( "#disconnect" ).click( function(){
		//Redirect to Main Page
		connection.leave();
		var path=window.location.href.split("?")[0];
		window.location.href=path;
	});
	connection.isTyping=false;

	//Chat window
	$("#txtChat").keyup(function(e){
		if(!connection.isTyping){
			connection.isTyping=true;
			connection.send("istyping");
		}
    if(e.keyCode != 13) return;

		connection.isTyping=false;
    
    // removing trailing/leading whitespace
    this.value = this.value.replace(/^\s+|\s+$/g, '');

    if (!this.value.length) return;
    
    connection.send(this.value);
    var chatWindow = document.getElementById('chatHistory');
    appendDIV(chatWindow, this.value);
    this.value =  '';
		this.focus();

	});


	//Handle Connection 
	connection.onopen = function(event) {
		event.data="online";
    var chatWindow = document.getElementById('chatHistory');
		appendDIV(chatWindow, event);
	};

	connection.onleave = function(event) {
		event.data="offline";
    var chatWindow = document.getElementById('chatHistory');
		appendDIV(chatWindow, event);
	};

	connection.onmessage = function (event) {
		var obj=$("#chatStatus").children("#"+event.userid);
		if(event.data.toLowerCase()=="istyping"){
			if(!obj.length){
				$("#chatStatus").append("<div id='"+event.userid+"'></div>");
				obj=$("#chatStatus").children("#"+event.userid);
			}
			obj.html(event.userid+" is typing");
			return;
		}
		if(obj.length) obj.html("");
    var chatWindow = document.getElementById('chatHistory');
		appendDIV(chatWindow, event);
	};




	//Check qs
	//
	var roomName=$.QueryString["join"];
	if(roomName === undefined){
		$(".confRoom").addClass("hidden");
	}
	else{
		joinRoom(roomName);
	}

});

function appendDIV(obj, event) {
    var div = document.createElement('div');
    var userid=(event.userid===undefined)? "Me":event.userid;
    var msg=userid+": "+(event.data || event);
    div.innerHTML = msg;
    obj.insertBefore(div, obj.firstChild);
    div.tabIndex = 0; div.focus();
    
}


function joinRoom(roomName){
		var sessionid=roomName;
		$(".confRoom").removeClass("hidden");
		$(".main").addClass("hidden");
		$(".joinMe").addClass("hidden");
		$("#roomName").html(sessionid);
    signaler.getRoomFromServer(sessionid, function(sessionid) {
        connection.channel = connection.sessionid = sessionid;
        connection.join({
            sessionid: sessionid,
            extra: {},
            session: connection.session
        });
    });

}
(function($) {
    $.QueryString = (function(a) {
        if (a === "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));
})(jQuery);

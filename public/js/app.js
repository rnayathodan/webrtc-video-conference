var connection, signaler;
$( document ).ready(function() {
	//create a new connection
	connection = new RTCMultiConnection();

	//assign the container for local/remote videos
	connection.body = document.getElementById('videoContainer');

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

    connection.channel = connection.sessionid = connection.userid = sessionid;
		//Create a new Room and connection
    connection.open({
        onMediaCaptured: function() {
            signaler.createNewRoomOnServer(connection.sessionid);
						$("#disconnect").removeClass("hidden");
        }
    });

	});

	//handle button disconnect
	$( "#disconnect" ).click( function(){
		connection.leave();
		$(".main").removeClass("hidden");
		$(".confRoom").addClass("hidden");
		$("#session-id").focus();
		//Cleanup connection
	});


	//Handle Connection 
	connection.onopen = function() {
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
            userid: sessionid,
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

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
		$("#open").addClass("hidden");
		$("#join").addClass("hidden");

    connection.channel = connection.sessionid = connection.userid = sessionid;
		//Create a new Room and connection
    connection.open({
        onMediaCaptured: function() {
            signaler.createNewRoomOnServer(connection.sessionid);
						$("#disconnect").removeClass("hidden");
        }
    });

	});

	$( "#join" ).click( function(){
    var sessionid = document.getElementById('session-id').value;
    if (sessionid.replace(/^\s+|\s+$/g, '').length <= 0) {
        alert('Please enter session-id');
        document.getElementById('session-id').focus();
        return;
    }

    //this.disabled = true;
		$("#open").addClass("hidden");
		$("#join").addClass("hidden");
    signaler.getRoomFromServer(sessionid, function(sessionid) {
        connection.channel = connection.sessionid = sessionid;
				$("#disconnect").removeClass("hidden");
        connection.join({
            sessionid: sessionid,
            userid: sessionid,
            extra: {},
            session: connection.session
        });
    });

	});

	//handle button disconnect
	$( "#disconnect" ).click( function(){
		$("#open").removeClass("hidden");
		$("#join").removeClass("hidden");
		$("#disconnect").addClass("hidden");
		//Cleanup connection
		connection.leave();
	});


	//Handle Connection 
	connection.onopen = function() {
	};

	$("#disconnect").removeAttr("disabled");
	$("#disconnect").addClass("hidden");

});


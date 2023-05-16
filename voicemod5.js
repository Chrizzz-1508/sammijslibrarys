var Voicemod = (function(){

    var selectedVoice = "nofx";
    var currentPort = -1;
    var connected = false;

    var options = {
        uri : "ws://localhost",
        port : [59129, 20000, 39273, 42152, 43782, 46667, 35679, 37170, 38501, 33952, 30546],
        path : "/v1",
        onConnect : null,
        onDisconnect : null,
        onMessage : null
    }

    var onLoad = function() {
        if (connected) {
            return;
        }
        connected = true;

        currentPort++;
        if (currentPort > options.port.length - 1) {
            currentPort = 0;
        }

        var wsUri = options.uri + ":" + options.port[currentPort] + options.path;
        try {
            websocket = new WebSocket(wsUri);
            websocket.onopen = onOpen;
            websocket.onclose = onClose;
            websocket.onmessage = onMessage;
        }
        catch(err) {
            onClose();
        }   
    }

    var onOpen = function(evt) {
        if (options.onConnect != null) {
            options.onConnect();
        }
    }

    var onClose = function(evt) {
        connected = false;
        if (options.onDisconnect != null) {
            options.onDisconnect();
        }
    }

    var onMessage = function(evt) {
        if (evt.data) {
            message = JSON.parse(evt.data);

            if (message.actionType || message.action) {
                var action = message.actionType || message.action;

                switch (action) {
                    case 'getVoices':
                        if (message.actionObject) {
                            var voices = message.actionObject.voices;
                            // Process the list of voices
                            if (options.onMessage != null) {
                                options.onMessage(voices);
                            }
                        }
                        break;
                    case 'getCurrentVoice':
                        selectedVoice = message.payload.voiceId;
                        // Process the current voice change
                        if (options.onMessage != null) {
                            options.onMessage(selectedVoice);
                        }
                        break;
                    case 'voiceParameterUpdated':
                        // Process voice parameter changes
                        if (options.onMessage != null) {
                            options.onMessage(message.payload);
                        }
                        break;
                    default:
                        // Handle other actions if needed
                }
            }
        }
    }

    var sendMessage = function(message) {
        websocket.send(message);
    }
	
	this.sendMessageToServer = function(message, value = null, actionID = 100, contextID = "") {
        var jsonArray;
        var actionObject = {};
        
        switch(message) {
            case 'registerClient':
                actionObject["clientKey"] = value;
                break;
            case 'getVoiceBitmap':
                actionObject["voiceID"] = value;
                message = 'getBitmap';
                break;
            case 'getMemeBitmap':
                actionObject["memeId"] = value;
                message = 'getBitmap';
                break;
            case 'playMeme':
                actionObject["FileName"] = value;
                actionObject["IsKeyDown"] = true;
                break; 
            case 'selectVoice':
            case 'loadVoice':
                if (typeof value === 'string') {
                    actionObject["voiceID"] = value;
                    actionObject["voiceId"] = value;
                } else {
                    actionObject = value;
                }
                break;
            case 'toggleMuteMic':
                actionObject["toggleMute"] = value;
                break;
            case 'toggleVoiceChanger':
                if(value != null)
                    actionObject["toggleVoiceChanger"] = value;
                break;
            case 'setBeepSound':
                actionObject["badLanguage"] = value;
                break;                
            case 'setVoiceParameter':
                if (value != null)
                    actionObject = value;
                break;
            default:
                if (value != null)
                    actionObject = value;
                break;
        }

        if (options.path === '/v1'){
            jsonArray = {
                "id" : actionID,
                "payload" : actionObject,
                "action" : message,
            };
        } else if(options.path === '/vmsd') {
            jsonArray = {
                "actionId" : actionID,
                "actionType" : message,
                'pluginVersion': 'v1',
                "context" : actionObject,
            };
        }

        var messageToSend = JSON.stringify(jsonArray);
        sendMessage(messageToSend);
    }

    this.init = function(optionsObj = {}) {
        options = Object.assign({}, options, optionsObj);
        connect();
    }

    this.connect = function() {
        onLoad();
    }

    this.disconnect = function() {
        if (connected) {
            websocket.close();
        }
    }

    this.selectVoice = function(voiceId) {
        selectedVoice = voiceId;
        var message = JSON.stringify({
            action: 'selectVoice',
            actionObject: { voiceID: voiceId }
        });
        sendMessage(message);
    }

    return this;
})();
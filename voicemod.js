var Voicemod = (function(){

    var pluginVersion = "1.0.0";
    var boolBackgroundEnabled = false;
    var boolHearMyVoiceEnabled = false;
    var boolMuteEnabled = false;
    var boolMuteMemeForMeEnabled = false;
    var boolBadLanguage = false;
    var boolVoiceChangerEnabled = false;
    var stringLicenseType = "free";
    var selectedVoice = "nofx";
    var currentParameters = {};
    var currentPort = -1;
    var connected = false;

    var options = {
        uri : "ws://localhost",
        port : [59129, 20000, 39273, 42152, 43782, 46667, 35679, 37170, 38501, 33952, 30546],
        path : "/v1",
        autoRetry : false, 
        onConnect : null,
        onDisconnect : null,
        onError : null,
        onMessage : null, 
        onDebug : null 
    }

    var logPrint = function(message) {
        if(options.onDebug != null){
            var currentdate = new Date(); 
            var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth()+1) + "-" + currentdate.getDate() + " "
            + currentdate.getHours() + ":"  
            + currentdate.getMinutes() + ":" 
            + currentdate.getSeconds();

            message = datetime + ' - ' + message;

            options.onDebug(message);            
        }
    }

    var onLoad = function() {
        logPrint("onLoad");
        
        if(connected){
            logPrint("Already Connected");
            return;
        }
        connected = true;

        currentPort++;
        if(currentPort > options.port.length -1 ) currentPort = 0;

        var wsUri = options.uri + ":" + options.port[currentPort] + options.path;
        try {
            websocket = new WebSocket(wsUri);
            websocket.onopen = onOpen;
            websocket.onclose = onClose;
            websocket.onmessage = onMessage;
            websocket.onerror = onError;
        }
        catch(err) {
            logPrint(err);
            onClose();
        }   
    }

    var onOpen = function(evt) {
        logPrint("onOpen");
        if(options.onConnect != null)
            options.onConnect();
    }

    var onClose = function(evt) {
        logPrint("onClose autoRetry");
        connected = false;
        if(options.onDisconnect != null)
            options.onDisconnect();
        if(options.autoRetry){
            setTimeout(function() {
                logPrint("Retrying to connect");
                onLoad();
            }, 250);
        }            
    }

    var onError = function(evt) {
        logPrint("onError");
        if(options.onError != null)
            options.onError();   
    }

    var parseIfNeeded = function(actionObject)
    {
        if(typeof(actionObject) === "string")
        {
            return JSON.parse(actionObject);
        }
        return actionObject;
    }

    var onMessage = function(evt) {
        logPrint("onMessage");
        if (evt.data) {
            logPrint("Message received: " + evt.data);
            message = JSON.parse(evt.data);
            if (message.actionType || message.action){
                var action = message.actionType || message.action;                
                switch(action) {
                    case 'registerClient':
                        if (message.actionObject || message.payload) {
                            logPrint('Plugin registered!');
                            if(message.actionObject)
                                stringLicenseType = message.actionObject.licenseType;
                            // else {
                            //     Voicemod.sendMessageToServer('getUserLicense');
                            //     }

                            updateUI();
                        }
                        break
                    case 'getVoices':
                        console.log("#### getVOICES ", message);
                        if (message.actionObject) {
                            logPrint('Get list of voices');
                        }
                        break
                    case 'getBitmap':
                        if (message.actionObject) {
                            logPrint('Get Bitmap data');
                        }
                        break
                    case 'backgroundEffectsEnabledEvent':
                        boolBackgroundEnabled = true;
                        updateUI();
                        break
                    case 'backgroundEffectsDisabledEvent':
                        boolBackgroundEnabled = false;
                        updateUI();
                        break
                    case 'muteMicrophoneEnabledEvent':
                        boolMuteEnabled = true;
                        updateUI();
                        break
                    case 'muteMicrophoneDisabledEvent':
                        boolMuteEnabled = false;
                        updateUI();
                        break
                    case 'muteMemeForMeEnabledEvent':
                        boolMuteMemeForMeEnabled = true;
                        updateUI();
                        break
                    case 'muteMemeForMeDisabledEvent':
                        boolMuteMemeForMeEnabled = false;
                        updateUI();
                        break
                    case 'badLanguageEnabledEvent':
                        boolBadLanguage = true;
                        updateUI();
                        break
                    case 'badLanguageDisabledEvent':
                        boolBadLanguage = false;
                        updateUI();
                        break
                    case 'hearMySelfEnabledEvent':
                        boolHearMyVoiceEnabled = true;
                        updateUI();
                        break
                    case 'hearMySelfDisabledEvent':
                        boolHearMyVoiceEnabled = false;
                        updateUI();
                        break
                    case 'voiceChangerEnabledEvent':
                        boolVoiceChangerEnabled = true;
                        updateUI();
                        break
                    case 'voiceChangerDisabledEvent':
                        boolVoiceChangerEnabled = false;
                        updateUI();
                        break
                    case 'licenseTypeChangedEvent':
                        if (message.actionObject) {
                            logPrint('Get LicenseTypeChangedEvent');
                            message.actionObject = parseIfNeeded(message.actionObject);
                            stringLicenseType = message.actionObject.licenseType;
                            updateUI();
                        }
                        break
                    case 'voiceLoadedEvent':
                        if (message.actionObject) {
                            logPrint('Get voiceLoadedEvent');
                            logPrint(message.actionObject.voiceID);
                            message.actionObject = parseIfNeeded(message.actionObject);
                            if(message.actionObject.voiceID === "custom")
                                return;
                            selectedVoice = message.actionObject.voiceID;
                            updateUI();
                        }
                        break
                    case 'parametersChangedEvent':
                        if (message.actionObject) {
                            logPrint('Get parametersChangedEvent');
                            message.actionObject = parseIfNeeded(message.actionObject);
                            if(message.actionObject.voiceID == "custom")
                                return;
                            currentParameters = message.actionObject.parameters;
                        }
                        break                        
                    case 'parameterChangedEvent':
                        if (message.actionObject) {
                            logPrint('Get parameterChangedEvent');
                            message.actionObject = parseIfNeeded(message.actionObject);
                            if(message.actionObject.voiceID == "custom")
                                return;
                            currentParameters = message.actionObject.parameters;
                        }
                        break                        
                    default:
                }
                if(options.onMessage != null)
                    if(message.actionType)
                        options.onMessage(message.actionType, message.actionObject, message.actionID); 
                    else
                    options.onMessage(message.action, message.payload); 
            } else {
                logPrint("No ActionType");
            }
   
        }
    }

    var sendMessage = function(message) {
        logPrint("Message sent: " + message);
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
                actionObject["voiceID"] = value;
                actionObject["voiceId"] = value;
                break;
            case 'mute_OnOff':
                actionObject["toggleMute"] = value;
                break;
            case 'voiceChanger_OnOff':
                if(value != null)
                    actionObject["toggleVoiceChanger"] = value;
                break;
            case 'beepSound_OnOff':
                actionObject["badLanguage"] = value;
                break;                
            case 'setVoiceParameter':
                if(value != null)
                actionObject = value;
                break;                
            default:
                break;
        }

        jsonArray = {
            "id" : actionID,
            "payload" : actionObject,
            "action" : message,            
        };

        var messageToSend = JSON.stringify(jsonArray);
        sendMessage(messageToSend);
    }

    this.init = function(optionsObj={}) {
        options = Object.assign( {}, options, optionsObj );
        logPrint(options);
        connect();
    }

    this.connect = function() {
        onLoad();
    }

    this.disconnect = function() {
        if(connected)
            websocket.close();
    }

    Object.defineProperty(this,'backgroundEnabled',{
        get:function(){
            return boolBackgroundEnabled;
        }
    })
    Object.defineProperty(this,'hearMyVoiceEnabled',{
        get:function(){
            return boolHearMyVoiceEnabled;
        }
    })
    Object.defineProperty(this,'voiceChangerEnabled',{
        get:function(){
            return boolVoiceChangerEnabled;
        }
    })
    Object.defineProperty(this,'badLanguageEnabled',{
        get:function(){
            return boolBadLanguage;
        }
    })    
    Object.defineProperty(this,'muteMemeForMeEnabled',{
        get:function(){
            return boolMuteMemeForMeEnabled;
        }
    })    
    Object.defineProperty(this,'licenseType',{
        get:function(){
            return stringLicenseType;
        }
    })    
    Object.defineProperty(this,'muted',{
        get:function(){
            return boolMuteEnabled;
        }
    })
    Object.defineProperty(this,'port',{
        get:function(){
            return options.port;
        },
        set:function(newPort){
            currentPort = -1;
            options.port = newPort;
        }
    })
    Object.defineProperty(this,'currentVoice',{
        get:function(){
            return selectedVoice;
        }
    })

    Object.defineProperty(this,'isConnected',{
        get:function(){
            return connected;
        }
    })

    return this;
})();
Voicemod.init({
    port: "[59129, 20000, 39273, 42152, 43782, 46667, 35679, 37170, 38501, 33952, 30546]".split(","),
    autoRetry: true,
    onConnect: function(){
        console.log("VM Connected");        
        Voicemod.sendMessageToServer('registerClient', 'anyClient');
    },
    onDisconnect: function(){
        console.log("VM Disconnected");
    },
    onError: function(){
        console.log("VM error");        
    },        
    onMessage: function(actionType, actionObject, actionID){        
        if(actionObject != null && typeof(actionObject) === "string")
        {
            actionObject = JSON.parse(actionObject);
        }
        
        switch(actionType){                        
            case "registerClient":                
                Voicemod.sendMessageToServer('getUserLicense');
                Voicemod.sendMessageToServer('getVoices');
                Voicemod.sendMessageToServer('getCurrentVoice');
                break;
            case "getVoices":
                console.log("loadInterfaceVoices");
                loadInterfaceVoices(actionObject);
                break;
            case "voiceChangedEvent":
                console.log("voiceChangedEvent");
                break;
            case 'toggleBackground':
            case 'toggleMuteMic':
            case 'toggleHearMyVoice':
            case 'toggleVoiceChanger':
                break;
        }
        
    }
});


function loadInterfaceVoices(vmData) {
    /*if (vmData && vmData !== 'null' && vmData !== 'undefined') {

        //general settings
        vmData.outputLevel;

        divFreeVoices = document.getElementById("divFreeVoices");
        divAllVoices = document.getElementById("divAllVoices");
        divFavoriteVoices = document.getElementById("divFavoriteVoices");
        divCustomVoices = document.getElementById("divCustomVoices");

        //if is a pro user
        if (vmData.voices) {

            vmData.voices.sort(function(a, b) {
                return a.friendlyName.localeCompare(b.friendlyName)
            });
            $("#listAllVoices").empty();
            $("#listFavoriteVoices").empty();
            $("#listCustomVoices").empty();
            $("#listFreeVoices").empty();
            for (var i = 0; i < vmData.voices.length; i++) {
                let voice = vmData.voices[i];
                $("#listAllVoices").append("<li class='voice " + voice.id + "' id='" + voice.id + "' data-voiceID='" + voice.id + "'><img />" + voice.friendlyName + "</li>");
                if(Voicemod.licenseType == "free"){
                    if(voice.enabled){
                        $("#listFreeVoices").append("<li class='voice " + voice.id + "' id='" + voice.id + "' data-voiceID='" + voice.id + "'><img />" + voice.friendlyName + "</li>");
                    }
                } else {
                    if(voice.favorited){
                        $("#listFavoriteVoices").append("<li class='voice " + voice.id + "' id='" + voice.id + "' data-voiceID='" + voice.id + "'><img />" + voice.friendlyName + "</li>");
                    }
                    if(voice.isCustom){
                        $("#listCustomVoices").append("<li class='voice " + voice.id + "' id='" + voice.id + "' data-voiceID='" + voice.id + "'><img />" + voice.friendlyName + "</li>");
                    }
                }
                Voicemod.sendMessageToServer("getVoiceBitmap",voice.id);
            }
            jQuery("#divAllVoices").show();
            jQuery("#divFavoriteVoices").show();
            jQuery("divCustomVoices").show();

        }

        jQuery(".voice").click(function(){
            Voicemod.sendMessageToServer("selectVoice", jQuery(this).data("voiceid"));
        });
        updateUI();
    }*/
}
var log = jQuery("#log");
	var state = jQuery("#status")[0];

	Voicemod.init({
		port: "59129,20000,39273,42152,43782,46667,35679,37170,38501,33952,30546".split(","),
		autoRetry: true,
		onConnect: function(){
			SAMMI.alert("VoiceMod connected");        
			Voicemod.sendMessageToServer('registerClient', 'anyClient');
			state.className = "success";
			state.innerHTML = "Connected to server";
		},
		onDisconnect: function(){
			console.log("onDisconnect Delegado");
			state.className = "fail";
			state.innerHTML = "Not connected";
		},
		onError: function(){
			console.log("onError Delegado");        
			state.className = "fail";
			state.innerHTML = "Communication error";
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
					Voicemod.sendMessageToServer('getAllSoundboard');
					Voicemod.sendMessageToServer('getBackgroundEffectStatus');
					Voicemod.sendMessageToServer('getHearMyselfStatus');
					Voicemod.sendMessageToServer('getVoiceChangerStatus');
					Voicemod.sendMessageToServer('getMuteMemeForMeStatus');
					Voicemod.sendMessageToServer('getMuteMicStatus');
					Voicemod.sendMessageToServer('getCurrentVoice');
					updateUI();
					break;
				case "getVoices":
					console.log("loadInterfaceVoices");
					loadInterfaceVoices(actionObject);
					updateUI();
					break;
				case "getAllSoundboard":
					console.log("loadInterfaceMemes");
					loadInterfaceMemes(actionObject);
					updateUI();
					break;
				case "getBitmap":
					if(actionObject.voiceID)
						jQuery("." + actionObject.voiceID +" img").attr('src', 'data:image/gif;base64,'+actionObject.result.default);
					else
						jQuery("." + actionObject.memeId +" img").attr('src', 'data:image/gif;base64,'+actionObject.result.default);
					break;
				case "voiceChangedEvent":
					console.log("voiceChangedEvent");
					SAMMI.alert("Voice changed");
					break;
				case 'toggleBackground':
				case 'toggleMuteMic':
				case 'toggleHearMyVoice':
				case 'toggleVoiceChanger':
					updateUI();
					break;
			}
			
		},
		onDebug: function(debugMessage){
			log.append('<li class = "message">' + debugMessage + '</li>');
			jQuery("#log").scrollTop(9999999999)
		}
	});

	jQuery("#toggleVoiceChanger").click(function(){
		Voicemod.sendMessageToServer("voiceChanger_OnOff");
	});
	jQuery("#toggleHearMyVoice").click(function(){
		Voicemod.sendMessageToServer("hearMyVoice_OnOff");
	});
	jQuery("#toggleBackground").click(function(){
		Voicemod.sendMessageToServer("background_OnOff");
	});
	jQuery("#toggleMute").click(function(){
		Voicemod.sendMessageToServer("mute_OnOff", !Voicemod.muted);
	});
	jQuery("#randomVoice").click(function(){
		Voicemod.sendMessageToServer("selectRandomVoice");
	});
	jQuery("#pushToTalk").mousedown(function(){
		Voicemod.sendMessageToServer("voiceChanger_OnOff", 0);
	});
	jQuery("#pushToTalk").mouseup(function(){
		Voicemod.sendMessageToServer("voiceChanger_OnOff", 1);
	});
	jQuery("#badLanguage").mousedown(function(){
		Voicemod.sendMessageToServer("beepSound_OnOff", 1);
	});
	jQuery("#badLanguage").mouseup(function(){
		Voicemod.sendMessageToServer("beepSound_OnOff", 0);
	});
	jQuery("#muteMemeForMe").mouseup(function(){
		Voicemod.sendMessageToServer("toggleMuteForMeMeme");
	});
	jQuery("#getRotatoryVoicesRemainingTime").mouseup(function(){
		Voicemod.sendMessageToServer("getRotatoryVoicesRemainingTime");
	});
	jQuery("#getUserLicense").mouseup(function(){
		Voicemod.sendMessageToServer("getUserLicense");
	});
	jQuery("#getAllSoundboard").mouseup(function(){
		Voicemod.sendMessageToServer("getAllSoundboard");
	});
	$("#getCurrentVoice").mouseup(() => {
		Voicemod.sendMessageToServer("getCurrentVoice");
	});
	$("#getUser").mouseup(() => {
		Voicemod.sendMessageToServer("getUser");
	});
	jQuery("#clear").mouseup(function(){
		jQuery("#log").empty();
	});
	jQuery("#connect").click(function(){
		Voicemod.port = jQuery("#port").val();
		Voicemod.connect();
	});
	jQuery("#disconnect").click(function(){
		Voicemod.disconnect();
	});

	function loadInterfaceVoices(vmData) {
		if (vmData && vmData !== 'null' && vmData !== 'undefined') {

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
		}
	}


	function loadInterfaceMemes(vmData) {
		if (vmData && vmData !== 'null' && vmData !== 'undefined') {
			if (vmData.soundboards) {
				//all memes
				jQuery("#listMemes").empty();
				for (var i = 0; i < vmData.soundboards.length; i++) {
					var soundboard = vmData.soundboards[i];
					jQuery("#listMemes").append("<ul class='meme " + soundboard.id + "' id='" + soundboard.id + "'>" + soundboard.name + " " + (soundboard.showProLogo ? "(PRO)" : ""));
					for (var j = 0; j < soundboard.sounds.length; j++) {
						var sound = soundboard.sounds[j];
						if(sound.FileName != ""){
							jQuery("#listMemes").append("<li class='meme " + sound.id + "' id='" + sound.id + "' data-memeid='" + sound.id + "'><img />" + sound.name + " " + (sound.showProLogo ? "<br />(PRO)" : "") + "</li>");
							Voicemod.sendMessageToServer("getMemeBitmap",sound.id);
						}
					}
					jQuery("#listMemes").append("</ul>");
				}
				jQuery("#divMemes").show();

			}

			jQuery(".meme").click(function(){
				Voicemod.sendMessageToServer("playMeme", jQuery(this).data("memeid"));
			});
			updateUI();
		}
	}

	function updateUI(){
		jQuery("#toggleVoiceChanger").text("Voice Changer: " + (Voicemod.voiceChangerEnabled ? "ON" : "OFF"));
		jQuery("#toggleHearMyVoice").text("Hear My Voice: " + (Voicemod.hearMyVoiceEnabled ? "ON" : "OFF"));
		jQuery("#toggleBackground").attr("disabled", Voicemod.backgroundEnabled == null).text("Ambient Effects: " + (Voicemod.backgroundEnabled ? "ON" : "OFF"));
		jQuery("#toggleMute").text("Mute: " + (Voicemod.muted ? "ON" : "OFF"));
		jQuery("#badLanguage").text("Bad Language: " + (Voicemod.badLanguageEnabled ? "ON" : "OFF"));
		jQuery("#muteMemeForMe").text("Mute Meme for Me: " + (Voicemod.muteMemeForMeEnabled ? "ON" : "OFF"));
		jQuery("#licenseType").text("License Type: " + Voicemod.licenseType);
		jQuery(".voice.selected").removeClass("selected");
		jQuery("."+Voicemod.currentVoice).toggleClass("selected");
	}
pluginVersion = "2.0.0.0";
actionID = 100;
toggleBackground = 0;
toggleHearMyVoice = 0;
toggleMute = 0;
toggleVoiceChanger = 0;
selectedVoice = "nofx";

//data received from voicemod app
var vmData;

log = document.getElementById("log");
state = document.getElementById("status");

if (window.WebSocket === undefined) {
   state.innerHTML = "sockets not supported";
   state.className = "fail";
}else {
   if (typeof String.prototype.startsWith != "function") {
      String.prototype.startsWith = function (str) {
         return this.indexOf(str) == 0;
      };
   }
	
   window.addEventListener("load", onLoad, false);
}

function LogPrint(message) {

   var currentdate = new Date(); 
   var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth()+1) + "-" + currentdate.getDate() + " "
      + currentdate.getHours() + ":"  
      + currentdate.getMinutes() + ":" 
      + currentdate.getSeconds();

   log.innerHTML = log.innerHTML + '<li class = "message">' + datetime + ' - ' + message + '</li>';
   console.log(message);
}

function onLoad() {
   LogPrint("onLoad");
   var wsUri = "ws://localhost:50463/vmsd/";
   try {
      websocket = new WebSocket(wsUri);
      websocket.onopen = onOpen;
      websocket.onclose = onClose;
      websocket.onmessage = onMessage;
      websocket.onerror = onError;
   }
   catch(err) {
      console.log(err);
   }   
}

function onOpen(evt) {

   LogPrint("onOpen");

   state.className = "success";
   state.innerHTML = "Connected to server";

   //registerPlugin
   sendMessageToServer('registerPlugin');
}

function onClose(evt) {
   LogPrint("onClose");
   //console.log(evt);
   state.className = "fail";
   state.innerHTML = "Not connected";
}

function onError(evt) {
   LogPrint("onError");
   state.className = "fail";
   state.innerHTML = "Communication error";
}
					
function onMessage(evt) {

   LogPrint("onMessage");
   // console.log(evt);

   if (evt.data) {
      message = JSON.parse(evt.data);

      // console.log(evt.data);
      console.log(message);

      if (message.actionType){
         
         switch(message.actionType) {
            case 'registerPlugin':
               LogPrint('Plugin registered!');
               sendMessageToServer('getVoices');
            break
            case 'getVoices':
               if (message.actionObject) {
                  LogPrint('Get list of voices');
                  console.log(message.actionObject);

                  vmData = message.actionObject;
                  loadInterface();
               }
               break
            case 'getBitmap':
               if (message.actionObject) {
                  LogPrint('Get Bitmap data');
                  jQuery("#"+message.actionObject.voiceID+" img").attr('src', 'data:image/gif;base64,'+message.actionObject.result.default);
                  vmData = message.actionObject;
               }
               break
            case 'toggleBackground':
               if (message.actionObject) {
                  LogPrint('Get toggleBackground');
                  toggleBackground = message.actionObject.value;
               }
               break
            case 'toggleMute':
               if (message.actionObject) {
                  LogPrint('Get toggleMute');
                  toggleMute = message.actionObject.value;
               }
               break
            case 'toggleHearMyVoice':
               if (message.actionObject) {
                  LogPrint('Get toggleHearMyVoice');
                  toggleHearMyVoice = message.actionObject.value;
               }
               break
            case 'toggleVoiceChanger':
               if (message.actionObject) {
                  LogPrint('Get toggleVoiceChanger');
                  toggleVoiceChanger = message.actionObject.value;
               }
            break
            case 'voiceChangedEvent':
               if (message.actionObject) {
                  LogPrint('Get voiceChangedEvent');
                  // console.log(message.actionObject);
                  selectedVoice = message.actionObject.voiceID;
               }
               break
         }
         updateUI();
      } else {
         console.log("no actionType");
      }
   }
}

function sendMessageToServer(message, value) {
   var jsonArray;
   switch(message) {
      case 'registerPlugin':
      break;
      case 'getVoices':
      break;
      default:
      // code block
   }

   jsonArray = {
      "actionID" : actionID,
      "actionObject" : {"voiceID" : value, "toggleMute" : value},
      "actionType" : message,
      "context" : "",
      "pluginVersion" : pluginVersion
   };

   var messageToSend = JSON.stringify(jsonArray);
   sendMessage(messageToSend);
}

function sendMessage(message) {
   LogPrint("Message sent: " + message);
   console.log("websocket.send(message)");
   console.log(websocket.send(message));
}






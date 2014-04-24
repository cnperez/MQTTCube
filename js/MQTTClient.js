//
// requires mqttws31.js
//

var defaultBroker = "messagesight.demos.ibm.com";
var defaultPort = 1883;
var baseTopic = "TiSensorTag";
var topics = [baseTopic + "/accelerometer/x", 
              baseTopic + "/accelerometer/y", 
              baseTopic + "/accelerometer/z"];
var clientId = "Client" + Math.floor(10000 + Math.random() * 90000);
var client = null;

// initialize form inputs
$("#connectBroker").val(defaultBroker);
$("#connectPort").val(defaultPort);
$(".requiresConnect").attr("disabled", true);

// set button callbacks
$("#connectButton").click(function(event) {
	var broker = $("#connectBroker").val();
	var port = $("#connectPort").val();
	connect(broker, port);
  //appendLog("yo dawg!");
});

$("#disconnectButton").click(function(event) {
	client.disconnect();
});

// MQTT client actions 
function connect(broker, port) {
  
	try {
		client = new Messaging.Client(broker, parseFloat(port), clientId);
	} catch (error) {
		alert("Error:"+error);
	}

	client.onMessageArrived = onMessage;
  
	client.onConnectionLost = function() { 
		$("#connectedAlert").fadeOut();
		$(".requiresConnect").attr("disabled", true);
		$(".requiresDisconnect").attr("disabled", false);
		appendLog("Disconnected from " + broker + ":" + port);
	}

	var connectOptions = new Object();
	connectOptions.cleanSession = true;
  connectOptions.useSSL = false;
	connectOptions.keepAliveInterval = 3600;  // if no activity after one hour, disconnect
  
	connectOptions.onSuccess = function() { 
		$("#connectedAlert").html("Connected!");
		$("#connectedAlert").fadeIn();
		$("#errorAlert").fadeOut();
		$("#connectToggle").click();
		$("#subscribeToggle").click();
		$(".requiresConnect").attr("disabled",false);
		$(".requiresDisconnect").attr("disabled",true);
		appendLog("Connected to " + broker + ":" + port);
    topics.forEach(subscribe);
	}
  
	connectOptions.onFailure = function() { 
		$("#errorAlertText").html("Failed to connect!");
		$("#connectedAlert").fadeOut();
		$("#errorAlert").fadeIn();
		setTimeout(function() { $("#errorAlert").fadeOut(); }, 2000);
		$(".requiresConnect").attr("disabled",true);
		$(".requiresDisconnect").attr("disabled",false);
		appendLog("Failed to connect to " + broker + ":" + port);
	}

	client.connect(connectOptions);
  
}

function subscribe(topic) {
  var qos = 0;
  client.subscribe(topic, {
		qos: qos,
		onSuccess: function() {
			appendLog("Subscribed to [" + topic + "][qos " + qos + "]");
		},
		onFailure: function() {
			appendLog("Subscription failed: [" + topic + "][qos " + qos + "]");
		}
	});
}

// function called whenever our MQTT connection receives a message
function onMessage(msg) {
	var topic = msg.destinationName;
	var payload = msg.payloadString;
	var qos = msg._getQos();
	var retained = msg._getRetained();
	var qosStr = ((qos > 0) ? "[qos " + qos + "]" : "");
	var retainedStr = ((retained) ? "[retained]" : "");
	appendLog(">> [" + topic + "]" + qosStr + retainedStr + " " + payload);
  updateCube(topic, payload);
}

// logging

function appendLog(msg) {
	msg = "(" + ((new Date()).toISOString().split("T"))[1].substr(0, 12) + ") " + msg;
	$("#logContents").append(msg + "\n");
	$("#logContents").prop("scrollTop", $("#logContents").prop("scrollHeight") - $("#logContents").height());
}

function clearLog() {
	$("#logContents").html("");
}

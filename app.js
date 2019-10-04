'use strict';
require('dotenv').config()

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var azclient;
var Message = require('azure-iot-device').Message;

const mqtt = require('mqtt')
var mclient = mqtt.connect(process.env.BROKER)
var topics = process.env.TOPICS

mclient.on('connect', function () {
  console.log(`connected to ${process.env.BROKER}`)
  for (var i = 0; i < topics.length; i++){
    mclient.subscribe(topics[i], function (err) {
      if (err) {
        console.error(err)
      } else 
      console.log(`subscribed to ${topics[i]}`)
    });
  }

});

mclient.on('message', function (topic, msg) {
  /*
  let deviceIdwithTopic = topic.substring(topic.indexOf('/') + 1)
  let topicIdx = deviceIdwithTopic.indexOf('/')
  let deviceId = deviceIdwithTopic.substr(0,topicIdx)
  let this_topic = deviceIdwithTopic.substr(topicIdx + 1)
  */
 var message = msg.toString('utf8');
 console.log(message)

  var outputMsg = new Message(message);
  azclient.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
});

Client.fromEnvironment(Transport, function (err, client) {
  azclient = client
  if (err) {
    throw err;
  } else {
    client.on('error', function (err) {
      throw err;
    });

    // connect to the Edge instance
    client.open(function (err) {
      if (err) {
        throw err;
      } else {
        console.log('IoT Hub module client initialized');

        // Act on input messages to the module.
        client.on('inputMessage', function (inputName, msg) {
          pipeMessage(client, inputName, msg);
        });
      }
    });
  }
});

// This function just pipes the messages without any change.
function pipeMessage(client, inputName, msg) {
  client.complete(msg, printResultFor('Receiving message'));

  if (inputName === 'input1') {
    var message = msg.getBytes().toString('utf8');
    if (message) {
      var outputMsg = new Message(message);
      client.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
    }
  }
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}
const Leap = require('leapjs');
const osc  = require("osc");
const eul2quat = require("euler-to-quaternion");

const div = require('vectors/div')(3)

var oscPort = new osc.UDPPort({
  localAddress: "127.0.0.1",
  localPort: 39572
});

var vmtReady = false;

const zeroPos = [0,0,0,0]
const onePos = [1,1,1,1]

oscPort.open();
oscPort.on("ready", function () {
  console.log("ready");
  vmtReady = true;

  sendReset();

  sendJoint(1, ENABLE_CONTROLLER_R, zeroPos, zeroPos, "VMT_1" );
  sendJoint(2, ENABLE_CONTROLLER_L, zeroPos, zeroPos, "VMT_2" );
});

oscPort.on("message", function (oscMsg, timeTag, info) {
  console.log("An OSC message just arrived!", oscMsg);
  console.log("Remote info is: ", info);
});


const DISABLE = 0;
const ENABLE_TRACKER = 1;
const ENABLE_CONTROLLER_L = 2;
const ENABLE_CONTROLLER_R = 3;
const ENABLE_TRACKING_REFERENCE = 4;

Leap.loop({
  hand: function(hand){
    if(!vmtReady)
      return;
      
      var position = div(hand.palmPosition, 200);
      var rotation = eul2quat(hand.direction);

    // console.log(hand.arm.basis)
    console.log("position", position );
    console.log("direction", rotation );
    // console.log("type", hand.type );

    if(hand.type == "right")
      sendRoom(1, ENABLE_CONTROLLER_R, position, rotation, "VMT_1" );
    
    if(hand.type == "left")
      sendRoom(2, ENABLE_CONTROLLER_L, position, rotation, "VMT_2" );

    sendRoom(10, ENABLE_TRACKING_REFERENCE, zeroPos, zeroPos);
  }

});

function sendJoint(index, enable, position, rotation, serial ){
  oscPort.send({
    address:"/VMT/Follow/Unity",
    args: [
      {
          type: "i",
          value: index
      },
      {
          type: "i",
          value: enable
      },
      {
          type: "f",
          value: 0
      },
      {
        type: "f",
        value: position[0]
      },
      {
        type: "f",
        value: position[1]
      },
      {
        type: "f",
        value: position[2]
      },
      {
        type: "f",
        value: rotation[0]
      },
      {
        type: "f",
        value: rotation[1]
      },
      {
        type: "f",
        value: rotation[2]
      },
      {
        type: "f",
        value: rotation[3]
      },
      {
        type: "s",
        value: serial
      }
    ]
  }, "127.0.0.1", 39570)
}

function sendRoom(index, enable, position, rotation){
  oscPort.send({
    address:"/VMT/Room/Unity",
    args: [
      {
          type: "i",
          value: index
      },
      {
          type: "i",
          value: enable
      },
      {
          type: "f",
          value: 0
      },
      {
        type: "f",
        value: position[0]
      },
      {
        type: "f",
        value: position[1]
      },
      {
        type: "f",
        value: position[2]
      },
      {
        type: "f",
        value: rotation[0]
      },
      {
        type: "f",
        value: rotation[1]
      },
      {
        type: "f",
        value: rotation[2]
      },
      {
        type: "f",
        value: rotation[3]
      }
    ]
  }, "127.0.0.1", 39570)
}

function sendReset(){
  oscPort.send({
    address:"/VMT/Reset",
    args: []
  }, "127.0.0.1", 39570)
}
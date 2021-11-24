// Server Config
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const WebSocket = require('ws');

// Controller config
const rpio = require('rpio');
const ds18b20 = require('ds18b20');
const { Timer } = require("easytimer.js");

// Initialize websocket
const wss = new WebSocket.Server({ port: 3005 });

// Control
const sensorId = '28-011937c40830';
const runningTime = new Timer();
const jetTimer = new Timer();
let setPoint = 78;
let jets = false;
let status;

// Websocket Connection
wss.on('connection', function connection(ws) {
    const sendData = JSON.stringify({
		currentTemp: null,
		setPoint: null,
	});
    ws.send(sendData);
    ws.on('message', function incoming(message) {
        const res = JSON.parse(message);
        console.log(`received message:`, res);

        // Lower Setpoint
        if (res === 'setPointDown') {
            setPoint--;
            ws.send(JSON.stringify({'setPoint': setPoint}));
        }
        // Raise Setpoint
        if (res === 'setPointUp') {
            setPoint++;
            ws.send(JSON.stringify({'setPoint': setPoint}));
        }
        // Turn jets on
        if (res === 'jetsOn') {
            jets = true;
        }
        // Turn jets off
        if (res === 'jetsoff') {
            jets = false;
        }
    });
    ws.send(JSON.stringify(`message received from Node!`));

    const tempStream = setInterval(() => {
        ds18b20.temperature('28-011937c40830', function(err, value) {
            const curTempF = ( value * (9/5) ) + 32;
            ws.send(JSON.stringify({'currentTemp': curTempF}));
        });
    }, 250);

    // Handle websocket close
    ws.on('close', function close() {
        clearInterval(tempStream);
        console.log('disconnected');
      });
});

// Initialize GPIO pin as low
rpio.open(11, rpio.OUTPUT, rpio.LOW);
rpio.open(12, rpio.OUTPUT, rpio.LOW);
rpio.write(12, rpio.HIGH);

// monitor temp and turn on and off motor
const tempLoop = setInterval(manageTemp, 1000);

function manageTemp() {
    const curTempC = ds18b20.temperatureSync(sensorId);
    const curTempF = ( curTempC * (9/5) ) + 32;

    
    // Check to make sure temp isn't too high & turn off
    if (curTempF > 105) {
        rpio.write(11, rpio.LOW);
        clearInterval(tempLoop);
        console.log('Tub Emergency Shutdown');
        runningTime.reset();
    }
    
    // Check if temp is higher than setpoint & turn off
    if (curTempF > setPoint) {
        rpio.write(11, rpio.LOW);
        status = rpio.read(11);
        runningTime.reset();
    }
    
    // Check if temp is lower than set point & turn on
    if (curTempF < setPoint && rpio.read(11) === 0) {
        rpio.write(11, rpio.HIGH);
        status = rpio.read(11);
        runningTime.start();
    }

    if (jets) {
        jetTimer.start();
    }

    if (jetTimer.minutes < 60 && jets) {
        jets = true;
    }

    if (jetTimer.minutes > 60 && jets) {
        jets = false;
    }

}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})



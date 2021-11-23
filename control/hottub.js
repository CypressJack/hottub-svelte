// Server Config
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3005 });

let setPoint = 78;
let jets = false;
let status;

wss.on('connection', function connection(ws) {
    const sendData = JSON.stringify({
		currentTemp: 65,
		setPoint: 78,
	});
    ws.send(sendData);
    ws.on('message', function incoming(message) {
        const res = JSON.parse(message);
        console.log(`received message:`, res);
        if (res === 'setPointDown') {
            setPoint--;
            ws.send(JSON.stringify({'setPoint': setPoint}));
        }

        if (res === 'setPointUp') {
            setPoint++;
            ws.send(JSON.stringify({'setPoint': setPoint}));
        }

        if (res === 'jetsOn') {
            jets = true;
        }

        if (res === 'jetsoff') {
            jets = false;
        }
    });
    ws.send(JSON.stringify(`message received from Node!`));

    setInterval(() => {
        const curTempC = ds18b20.temperatureSync(sensorId);
        const curTempF = ( curTempC * (9/5) ) + 32;
        ws.send(JSON.stringify({'currentTemp': curTempF}));
    }, 250);

});

// Controller config
const rpio = require('rpio');
const ds18b20 = require('ds18b20');
const { Timer } = require("easytimer.js");

// Control logic
const sensorId = '28-011937c40830';
const runningTime = new Timer();
const jetTimer = new Timer();

// Initialize GPIO pin as low
rpio.open(11, rpio.OUTPUT, rpio.LOW);

const tempLoop = setInterval(manageTemp, 1000);

function manageTemp() {
    const curTempC = ds18b20.temperatureSync(sensorId);
    const curTempF = ( curTempC * (9/5) ) + 32;

    if (jets) {
        jetTimer.start();
    }

    // Check to make sure temp isn't too high & turn off
    if (curTempF > 105) {
        rpio.write(11, rpio.LOW);
        clearInterval(tempLoop);
        console.log('Tub Emergency Shutdown');
        runningTime.reset();
    }

    // Check if temp is higher than setpoint & turn off
    if (curTempF > setPoint && !jets) {
        rpio.write(11, rpio.LOW);
        status = rpio.read(11);
        runningTime.reset();
    }

    // Check if temp is lower than set point & turn on
    if ((curTempF < setPoint && rpio.read(11) === 0) || jets ) {
        rpio.write(11, rpio.HIGH);
        status = rpio.read(11);
        runningTime.start();
    }

    if (jetTimer.minutes < 60 && jets) {
        jets = true;
    }

    if (jetTimer.minutes > 60 && jets) {
        jets = false;
    }

}



// Express Server
app.use(cors());

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})



const rpio = require('rpio');
const ds18b20 = require('ds18b20');
const { Timer } = require("easytimer.js");

const sensorId = '28-011937c40830';
let setPoint = 78;

const runningTime = new Timer();

let status;

// Initialize GPIO pin as low
rpio.open(11, rpio.OUTPUT, rpio.LOW);

const tempLoop = setInterval(manageTemp, 1000);

function manageTemp() {
    const curTempC = ds18b20.temperatureSync(sensorId);
    const curTempF = ( curTempC * (9/5) ) + 32;

    console.log('Temp Fahrenheit = ', curTempF);

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
    if (curTempF < setPoint && rpio.read(11) === 0){
        rpio.write(11, rpio.HIGH);
        status = rpio.read(11);
        runningTime.start();
    }

    console.log('rpio pin status = ', status);
}



function logTimeValue(){
    console.log(runningTime.getTimeValues().seconds);
}
  

  setInterval(logTimeValue, 5000);
var rpio = require('rpio');

var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-rpi-apa102", "LedStrip", LedStripAccessory);
}

function LedStripAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.ledStripName = config["ledstrip_name"] || this.name; // fallback to "name" if you didn't specify an exact "ledstrip_name"
  this.binaryState = 0; // default state is OFF
  this.dataPin = config["dataPin"] || 23
  this.clockPin = config["clockPin"] || 24
  this.ledCount = config["ledCount"] || 300
  this.log("Led strip '" + this.ledStripName + "' init...");

  rpio.init({ gpiomem: true, mapping: 'gpio' });   // Use the GPIOxx numbering 
  rpio.open(this.clockPin, rpio.OUTPUT, 0);
  rpio.open(this.dataPin, rpio.OUTPUT, 0);
}


LedStripAccessory.prototype.writeByte = function(data) {
  for (var i = 0; i < 8; i++) {
    if (data & 0x80) {
      rpio.write(this.dataPin, rpio.HIGH);
    } else {
      rpio.write(this.dataPin, rpio.LOW);
    }

    rpio.write(this.clockPin, rpio.LOW);
    rpio.write(this.clockPin, rpio.HIGH);

    data <<= 1;
  }
}

LedStripAccessory.prototype.writeZeroBytes = function(count) {
  for (var i = 0; i < count; i++) {
    this.writeByte(0);
  }
}

LedStripAccessory.prototype.setBrightness = function(brightness) {

  this.writeZeroBytes(4); // header

  var globalBrightness = 8;

  for(var i = 0; i < this.ledCount; i++) {
    this.writeByte(0b11100000 | globalBrightness);
    this.writeByte(brightness); // B
    this.writeByte(brightness); // G
    this.writeByte(brightness); // R
  }

  this.writeZeroBytes(4); // footer
}

LedStripAccessory.prototype.getPowerOn = function(callback) {
  var powerOn = this.binaryState > 0;
  this.log("Power state for the '%s' is %s", this.ledStripName, this.binaryState);
  callback(null, powerOn);
}

LedStripAccessory.prototype.setPowerOn = function(powerOn, callback) {
  this.binaryState = powerOn ? 1 : 0; 
  if (this.binaryState == 1) {
    this.setBrightness(128);
  } else {
    this.setBrightness(0);
  }
  this.log("Set power state on the '%s' to %s", this.ledStripName, this.binaryState);
  callback(null);
}

LedStripAccessory.prototype.getServices = function() {
    var lightbulbService = new Service.Lightbulb(this.name);
    
    lightbulbService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getPowerOn.bind(this))
      .on('set', this.setPowerOn.bind(this));
    
    return [lightbulbService];
}

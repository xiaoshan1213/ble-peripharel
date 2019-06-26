var util = require('util');

var bleno = require('./node_modules/bleno-mac');
var fs = require('fs');
var arr = "";
var BlenoCharacteristic = bleno.Characteristic;

var convert = require('./node_modules/convert-string');

var EchoCharacteristic = function() {
  EchoCharacteristic.super_.call(this, {
    uuid: 'ec0e',
    properties: ['read', 'write', 'notify'],
    value: null
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

util.inherits(EchoCharacteristic, BlenoCharacteristic);

function writeToFile(data) {
  console.log(data);
  var buff = Buffer.from(data, 'base64');
  fs.writeFile("./test.zip", buff, function(err){
    console.log('to file error');
  })
}

EchoCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('EchoCharacteristic - onReadRequest: value = ' + this._value.toString('utf8'));
  callback(this.RESULT_SUCCESS, this._value);
};

EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;
  console.log('EchoCharacteristic - onWriteRequest: value = ' + this._value.toString('utf8'));
  var valueStr = data.toString('utf8');
  var mark = valueStr.charAt(0);
  console.log('EchoCharacteristic - onWriteRequest: mark = ' + mark);
  arr = arr.concat(valueStr.substr(1));
  if(mark == 1){
    writeToFile(arr);
  }

  if (this._updateValueCallback) {
    console.log('EchoCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('EchoCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

EchoCharacteristic.prototype.onUnsubscribe = function() {
  console.log('EchoCharacteristic - onUnsubscribe');
  bleno.disconnect();
  this._updateValueCallback = null;
};

module.exports = EchoCharacteristic;

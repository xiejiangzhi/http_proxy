var config = require(process.env.PWD + "/config/config").json;
var crypto_config = config.crypto;

var crypto = require("crypto");

exports.cipher = cipher;
exports.decipher = decipher;
exports.current_key = current_key;



///////////////////// Helper ////////////////////

function cipher(data){
  var ch = crypto.createCipher(
    crypto_config.algorithm, current_key()
  );

  ch.update(data);

  return ch.final();
}

function decipher(data){
  var dh = crypto.createDecipher(
    crypto_config.algorithm, current_key()
  );

  dh.update(data);

  return dh.final();
}


function current_date(){
  var date = new Date;
  var str = date.getFullYear() + "-" + date.getMonth() + "-" +
    date.getDay() + " " + date.getHours();

  return str;
}

function current_key(){
  var key = crypto_config.key + current_date();

  return key;
}




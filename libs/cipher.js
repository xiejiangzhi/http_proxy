var config = require(process.env.PWD + "/config/config").json;
var crypto_config = config.crypto;

var crypto = require("crypto");

exports.encipher = cipher;
exports.decipher = decipher;
exports.current_key = current_key;
exports.sha1_key = sha1_key;


var str_coding = "utf-8";
var cipher_coding = "hex";

///////////////////// Helper ////////////////////

function cipher(data, in_coding){
  var enbody = "";
  var ch = crypto.createCipher(
    crypto_config.algorithm, current_key()
  );

  enbody += ch.update(data, in_coding || str_coding, cipher_coding);
  enbody += ch.final(cipher_coding);

  return enbody;
}

function decipher(data, in_coding){
  var debody = "";
  var dh = crypto.createDecipher(
    crypto_config.algorithm, current_key()
  );

  debody += dh.update(data, in_coding || cipher_coding, str_coding);
  debody += dh.final(str_coding);

  return debody;
}

function sha1_key(str){
  var sha1 = crypto.createHash('sha1');
  sha1.update(str);

  return sha1.digest(cipher_coding);
}


function current_date(){
  var date = new Date;
  var str = date.getFullYear() + "-" + date.getMonth() + "-" +
    date.getDay() + " " + date.getHours();

  return str;
}

function current_key(){
  var key = sha1_key(crypto_config.key + current_date());

  return key;
}





var http = require('http');
var url = require('url');

var config = require(process.env.PWD + "/config/config").json;
var cipher = require(process.env.PWD + "/libs/cipher");

http.createServer(function(req, res){
  if (req.headers[config.headers_message_key] == null){
    request_test(res);

    return ;
  }

  // request body
  var body = "";
  req.on("data", function(chunk){
    body += chunk;
  });

  // request end, proxy 
  req.on("end", function(){
    var opt = request_options(req);

    console.log(" --------------------- client req data ---------------------");
    console.log(body);

    http_proxy(opt, body, res);
  });
}).listen(process.env.VCAP_APP_PORT || config.server_port);

/////////////////////////////////////
// http proxy

function http_proxy(opt, body, res){
  http.request(opt, function(req){
    set_response(req, res);
  }).on("error", function(error){
    res.end(error.toString());
  }).end(body);
}


//////////////////////// Helper //////////////////

// set require headers

function request_options(req){
  console.log("----------------------- request header ----------------------------");
  console.log("cipher: " + req.headers[config.headers_message_key]);
  console.log("key: " + cipher.current_key());
  var origin_data = {};
  try {
    origin_data = JSON.parse(
      cipher.decipher(req.headers[config.headers_message_key])
    );
  } catch (e) {
    console.log(e.toString());
  }
  console.log("decipher: " + JSON.stringify(origin_data));

  var opt = url.parse(origin_data['req_url']);
  delete req.headers[config.headers_message_key];

  opt.headers = req.headers;
  opt.headers["host"] = opt.host;
  opt.method = req.method;

  return opt;
}

// set response 
function set_response(req, res){
  res.writeHead(req.statusCode, req.headers);
  
  req.on("data", function(chunk){
    res.write(chunk);
  });

  req.on("end", function(){
    res.end();
  });
}

function request_test(res){
  http.get("http://www.baidu.com", function(test_res){
    test_res.on("data", function(chunk){
      test_res.write(chunk);
    });

    test_res.on("end", function(){
      res.end(body);
    });
  }).end();
}

function cipher_log(str){
  var buf = new Buffer(256);
  var len = buf.write(str);

  console.log(buf.toString('utf-8', 0, len));
}

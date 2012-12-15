
var http = require('http');
var url = require('url');

var config = require(process.env.PWD + "/config/config").json;
var cipher = require(process.env.PWD + "/libs/cipher");

http.createServer(function(req, res){
  // request body
  var body = "";
  req.on("data", function(chunk){
    body += chunk;
  });

  // request end, proxy 
  req.on("end", function(){
    var opt = request_options(req);

    http_proxy(opt, body, res);
  });
}).listen(config.server_port);

/////////////////////////////////////
// http proxy

function http_proxy(opt, body, res){
  http.request(opt, function(req){
    set_response(req, res);
  }).on("error", function(error){
    res.end("error: " + error);
  }).end(body);
}


//////////////////////// Helper //////////////////

// set require headers

function request_options(req){
  var opt = url.parse(req.headers["origin-url"]);

  delete req.headers["origin-url"];

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

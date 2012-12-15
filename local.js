
var http = require('http');
var url = require('url');

var config = require(process.env.PWD + "/config/config").json;
var cipher = require(process.env.PWD + "/libs/cipher");
config.fproxy_port = config.proxy_port ? ":" + config.proxy_port : ""

console.log("local port: " + config.local_port);
console.log(
  "server host: " + config.proxy_host +
  " - port: " + (config.proxy_port || 80)
);

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
}).listen(config.local_port);

/////////////////////////////////////
// http proxy

function http_proxy(opt, body, client_res){
  var start_time = new Date;

  console.log(opt);
  http.request(opt, function(proxy_res){
    set_response(proxy_res, client_res);

    proxy_res.on("end", function(){
      print_log(opt.headers.host, proxy_res.statusCode, start_time);
    });
  }).on("error", function(error){
    client_res.end("error: " + error);
  }).end(body);
}


//////////////////////// Helper //////////////////

function get_req_headers(req){
  var headers = req.headers;

  // reset connection kind
  if (headers["proxy-connection"]) {
    headers['connection'] = headers['proxy-connection'];
    delete headers['proxy-connection'];
  }

  headers[config.headers_url_key] = req.url;
  headers["host"] = url.parse(config.proxy_host).host;

  return headers;
}

// set require headers

function request_options(req){
  var opt = url.parse(config.proxy_host + config.fproxy_port);

  opt.headers = get_req_headers(req);
  opt.method = req.method;

  return opt;
}

// set response 
function set_response(proxy_res, client_res){
  client_res.writeHead(proxy_res.statusCode, proxy_res.headers);

  proxy_res.on("data", function(chunk){
    client_res.write(chunk);
  });

  proxy_res.on("end", function(){
    client_res.end();
  });
}

function print_log(url, status, start_time){
  console.log(
    '\033[90m' + url + '\t\033[33m' + status + '\t\033[36m' +
    (new Date - start_time) + 'ms \033[0m'
  );
}

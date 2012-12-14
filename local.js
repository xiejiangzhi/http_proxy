
var http = require('http');
var url = require('url');
var server_host = "http://localhost:8080";

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
}).listen(7878);

/////////////////////////////////////
// http proxy

function http_proxy(opt, body, client_res){
  var start_time = new Date;

  http.request(opt, function(proxy_res){
    set_response(proxy_res, client_res);
    
    console.log("proxy_res");

    proxy_res.on("end", function(){
      print_log(opt.headers.host, client_res.statusCode, start_time);
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

  return headers;
}

function print_log(url, status, start_time){
  if (status >= 400) {
    console.log("request headers: " + JSON.stringify(opt.headers));
  }

  console.log(
    '\033[90m' + url + '\t\033[33m' + status + '\t\033[36m' +
    (new Date - start_time) + 'ms \033[0m'
  );
}

// set require headers

function request_options(req){
  debugger
  var opt = url.parse(server_host);

  opt.headers = get_req_headers(req);
  opt.headers["origin-request-url"] = req.url
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

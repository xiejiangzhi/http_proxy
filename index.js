
var http = require('http');
var url = require('url');

http.createServer(function(req, res){
  // request body
  var body = "";
  req.on("data", function(chunk){
    body += chunk;
  });

  // request end, proxy 
  req.on("end", function(){
    var opt = url.parse(req.url);

    opt.headers = get_req_headers(req);
    opt.method = req.method;
    
    http_proxy(opt, body, res);
  });
  
}).listen(process.env.VCAP_APP_PORT || 3000);

/////////////////////////////////////
// http proxy

function http_proxy(opt, body, res){
  var start_time = new Date;

  http.request(opt, function(req){
    res.writeHead(req.statusCode, req.headers);

    req.on("data", function(chunk){
      res.write(chunk);
    });

    req.on("end", function(){
      res.end();
      
      if (res.statusCode >= 400) {
        console.log("request headers: " + JSON.stringify(opt.headers));
        console.log(
          '\033[90m' + opt.headers.host + '\t\033[33m' + res.statusCode + '\t\033[36m' +
          (new Date - start_time) + 'ms \033[0m'
        );
      }
    });
  }).on("error", function(error){
    res.end("error: " + error);
  }).end(body);  // end request
}

function get_req_headers(req){
  var headers = req.headers;

  // reset connection kind
  headers['connection'] = headers['proxy-connection'];
  delete headers['proxy-connection'];

  return headers;
}

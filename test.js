var http = require('http');

http.createServer(function (req, res) {
  if (req.url == "/"){
    console.log(req.headers);
  }

  res.end("test");
}).listen(3000);

NodeJS http proxy

server:

    node index.js

local:

    config:
      proxy_host: "http://www.server.com",
      proxy_port: 80,

      local_port: 7878,

    node local.js

set http proxy to:

    127.0.0.1:7878

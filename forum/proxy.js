
var httpProxy = require('http-proxy');

var proxyTable = {};

proxyTable['somanywords.vexterity.com'] = 'localhost:4055';
proxyTable['somanywords.so-many-words.com'] = 'localhost:4055';
proxyTable['vexterity.com'] = 'localhost:4045';
proxyTable['so-many-words.com'] = 'localhost:4045';
proxyTable['www.vexterity.com'] = 'localhost:4045';
proxyTable['www.so-many-words.com'] = 'localhost:4045';



var httpOptions = {
    router: proxyTable
};

console.log('Proxy Server Listening on port 80');
httpProxy.createServer(httpOptions).listen(80);
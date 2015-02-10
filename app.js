var express = require('express'),
    bodyParser = require('body-parser'),
    sanitizer = require('sanitizer'),
    config = require('./config.js'),
    app = express(),
    path = require('path'),
	  http = require('http'),
    server = http.Server(app),
    io = require('socket.io')(server),
    bl = require('bl'),
    dgram = require('dgram'),
    udpServer = dgram.createSocket('udp4'),
    nodes = {
    };

app.set('view_engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res){
  'use strict';
	res.render('index.ejs', {"nodes" :nodes});
});

app.get('/team', function(req, res){
  'use strict';
  res.render('team.ejs');
});

app.post('/command', function(req, res) {
  'use strict';
  var key, buf,
      santizingResult = JSON.parse(sanitizer.sanitize(JSON.stringify(req.body)));
  for(key in nodes) {
    if (nodes.hasOwnProperty(key)) {
      buf = new Buffer(santizingResult.cmd);
      udpServer.send(buf, 0, buf.length, config.UDPPORT_SEND, key);
    }
  }
  res.send("complete");
});

app.post('/update', function(req, res) {
  'use strict';
  var buf = new Buffer('active');
  udpServer.send(buf, 0, buf.length, config.UDPPORT_SEND, '127.0.0.1');
  res.send("complete");
});

server.listen((process.env.PORT || 80), function() {
  'use strict';
  console.log('listening on *:'+( process.env.PORT || 80));
});

udpServer.on('listening', function () {
  'use strict';
  console.log('UDP Server listening on ' + udpServer.address().address + ":" + udpServer.address().port);
});

udpServer.on('message', function (data, remote) {
  'use strict';
  console.log('from : ' + remote.address + ':' + remote.port);
  console.log(data.toString('utf8', 16));
/*  var msg = JSON.parse(data.toString('utf8', 16));
  if(!msg['error']) {

  } else {

  }
  console.log(msg);*/
	/*var node = JSON.parse(msg.toString('utf8', 16));
	node.port = msg.readUInt16LE(4);
	node.time = parseInt(msg.readUInt32LE(12).toString(16) + msg.readUInt32LE(8).toString(16), 16);
	node.status = "online";
	node.ip = intToIP(msg.readUInt32LE(0));
	nodes[node.ip] = node;
	console.log(node.ip + " : " + node.status);
	io.emit('nodenamechange', node);*/
});

udpServer.bind(config.UDPPORT_RECEIVE);

io.on('connection', function (socket) {
  'use strict';
	console.log('A user connected.');
	socket.on('disconnect', function () {
		console.log('A user disconnected.');
	});
});

/*
setInterval(function() {
  'use strict';
  var key;
	console.log("check nodes");
	for(key in nodes) {
		if(nodes[key].time + 3 * 60 * 1000 < (new Date()).getTime() && nodes[key].status !== "offline") {
			nodes[key].status = "offline";
			io.emit('nodenamechange', nodes[key]);
		}
	}
}, 3 * 60 * 1000);
*/

/*
function intToIP(int) {
  'use strict';
  var part1 = int & 255,
      part2 = ((int >> 8) & 255),
      part3 = ((int >> 16) & 255),
      part4 = ((int >> 24) & 255);
  return part1 + "." + part2 + "." + part3 + "." + part4;
}*/

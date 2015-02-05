var express = require('express'),
    app = express(),
    path = require('path'),
	http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
var bl = require('bl');
var dgram = require('dgram');
var udpServer = dgram.createSocket('udp4');
var nodes = {	
};

app.set('view_engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res){
	res.render('index.ejs', {"nodes" :nodes});		
});

app.get('/team', function(req, res){
  res.render('team.ejs');
});

app.post('/stopAll', function(req, res) {
	for(var key in nodes) {
		var buf = new Buffer("exit service");
		udpServer.send(buf, 0, buf.length, 7777, key);
	}
	console.log('stop signal sent');
	res.send("complete");
});

app.post('/startAll', function(req, res) {
	for(var key in nodes) {
		var buf = new Buffer("start monitor");
		udpServer.send(buf, 0, buf.length, 7777, key);
	}
	console.log('start signal sent');
	res.send("complete");
});

app.post('/pauseAll', function(req, res) {
	for(var key in nodes) {
		var buf = new Buffer("stop monitor");
		udpServer.send(buf, 0, buf.length, 7777, key);
	}
	console.log('pause signal sent');
	res.send("complete");
});
server.listen((process.env.PORT || 80), function(){
  console.log('listening on *:'+process.env.PORT);
});

udpServer.on('listening', function () {
    console.log('UDP Server listening on ' + udpServer.address().address + ":" + udpServer.address().port);
});

udpServer.on('message', function (msg, remote) {
    console.log('from : ' + remote.address + ':' + remote.port);
	var node = JSON.parse(msg.toString('utf8', 16));
	node.port = msg.readUInt16LE(4);
	node.time = parseInt(msg.readUInt32LE(12).toString(16) + msg.readUInt32LE(8).toString(16), 16);
	node.status = "online";
	node.ip = intToIP(msg.readUInt32LE(0));
	nodes[node.ip] = node;
	console.log(node.ip + " : " + node.status);
	io.emit('nodenamechange', node);
});

udpServer.bind(5700);

io.on('connection', function (socket) {
	console.log('A user connected.');
	socket.on('disconnect', function () {
		console.log('A user disconnected.');
	});
});
	
setInterval(function() {
	console.log("check nodes");
	for(var key in nodes) {
		if(nodes[key].time + 3 * 60 * 1000 < (new Date()).getTime() && nodes[key].status !== "offline") {
			nodes[key].status = "offline";
			io.emit('nodenamechange', nodes[key]);
		}
	}
}, 3 * 60 * 1000);


function intToIP(int) {
    var part1 = int & 255;
    var part2 = ((int >> 8) & 255);
    var part3 = ((int >> 16) & 255);
    var part4 = ((int >> 24) & 255);
    return part1 + "." + part2 + "." + part3 + "." + part4;
}
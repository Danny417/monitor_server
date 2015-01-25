var express = require('express'),
    app = express(),
    path = require('path'),
	http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
var bl = require('bl');
var nodes = {
	"204.85.191.11" : {
		name: 'planetlab2.cs.unc.edu',
		radius: 15,
		ip: '204.85.191.11',
		latency: '',
		fillKey: 'ok',
		date: new Date(),
		latitude: 11.415,
		longitude: 165.1619,
		city: 'unknown',
		isp: 'unknown',
		country: 'unknown',
		status: 'warning'
	}, '202.141.161.43' : {
		name: 'planetlab1.ustc.edu.cn',
		radius: 15,
		ip: '202.141.161.43',
		latency: '',
		fillKey: 'ok',
		date: new Date(),
		latitude: 11.415,
		longitude: 165.1619,
		city: 'unknown',
		isp: 'unknown',
		country: 'unknown',
		status: 'ok'
	}, '129.82.12.190' : {
		name: 'planetlab-2.cs.colostate.edu',
		radius: 15,
		ip: '129.82.12.190',
		latency: '',
		fillKey: 'ok',
		date: new Date(),
		latitude: 11.415,
		longitude: 165.1619,
		city: 'unknown',
		isp: 'unknown',
		country: 'unknown',
		status: 'ok'
	}, '116.89.165.133' : {
		name: 'pl1snu.koren.kr',
		radius: 15,
		ip: '116.89.165.133',
		latency: '',
		fillKey: 'ok',
		date: new Date(),
		latitude: 11.415,
		longitude: 165.1619,
		city: 'unknown',
		isp: 'unknown',
		country: 'unknown',
		status: 'ok'
	}, '124.42.76.29' : {
		name: 'planetlab2.iin-bit.com.cn',
		radius: 15,
		ip: '124.42.76.29',
		latency: '',
		fillKey: 'err',
		date: new Date(),
		latitude: 11.415,
		longitude: 165.1619,
		city: 'unknown',
		isp: 'unknown',
		country: 'unknown',
		status: 'failboot'
	}
};

app.set('view_engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res){
	updateLocation(function() {
		res.render('index.ejs', {"nodes" :nodes});		
	});
});

app.get('/test', function(req, res){
  nodes['129.82.12.190'].status = "warning";
  getGeoLoc(nodes['129.82.12.190'], function() {
	  io.emit('nodenamechange', nodes['129.82.12.190']);
	  res.render('index.ejs', {"nodes" :nodes});	  
  });
});

app.get('/team', function(req, res){
  res.render('team.ejs');
});

function getGeoLoc(node, callback) {
	http.get("http://ip-api.com/json/"+node.ip, function(res) {
		res.pipe(bl(function (err, data) {
			if (err)
			  console.log(err);
			else {
				var loc = JSON.parse(data.toString());
				if(loc.status !== undefined && loc.status === "fail") {
					console.log("Fail retrieving location for IP : "+node.ip);
				} else {
					node.latitude = loc.lat;
					node.longitude = loc.lon;
					node.city = loc.city;
					node.country = loc.country;
					node.isp = loc.isp;
					node.date = new Date();
				}		
				callback();
			}
		  })); 
	}).on("error", function(e) {
		console.log("Error : " + e.message);
	});
};

function updateLocation(callback) {
	var count = 0;
	for(var key in nodes) {
		count++;
	}
	for(var key in nodes) {
		getGeoLoc(nodes[key], function() {
			count--;
			if(count <= 0) {
				callback();
			}
		});
	}
}
server.listen(80, function(){
  console.log('listening on *:80');
});

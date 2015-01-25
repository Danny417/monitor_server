var express = require('express'),
    app = express(),
    path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var nodes = [
      {name: "p23.gl.planetlab.ca", status: "ok"},
      {name: "p24.gl.planetlab.ca", status: "warning"},
      {name: "p26.gl.planetlab.ca", status: "ok"},
      {name: "p27.gl.planetlab.ca", status: "error"},
      {name: "p23.xvb.plab.com", status: "ok"},
      {name: "p24.xvb.plab.com", status: "ok"},
      {name: "p26.xvb.plab.com", status: "ok"},
      {name: "p27.xvb.plab.com", status: "ok"},
      {name: "aa-1.e4.ubc.ca", status: "ok"},
      {name: "aa-2.e4.ubc.ca", status: "warning"},
      {name: "lx13.edubc.jk.lol", status: "ok"},
      {name: "lx14.edubc.jk.lol", status: "ok"},
      {name: "lx15.edubc.jk.lol", status: "ok"},
      {name: "lx16.edubc.jk.lol", status: "ok"},
      {name: "lx17.edubc.jk.lol", status: "ok"},
      {name: "lx18.edubc.jk.lol", status: "ok"},
    ];

app.set('view_engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res){
  res.render('index.ejs', {"nodes" :nodes});
});

app.get('/test', function(req, res){
  nodes[1].name = "Danny";
  io.emit('nodenamechange', nodes);
  res.render('index.ejs', {"nodes" :nodes});
});

app.get('/team', function(req, res){
  res.render('team.ejs');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(80, function(){
  console.log('listening on *:80');
});

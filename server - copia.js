var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var charm = require('charm')();
charm.pipe(process.stdout);
charm.reset();

var ids = [];
var clients = [];

app.use(express.static('public'));

io.on('connection', function(socket){
  var interval;

  socket.emit("cmd", "hello");

  socket.on("cmd", function(msg) {
    if (msg.cmd == "hello")
    {
      console.log("New client: " + socket.id + " \t'" + msg.name + "'");
      clients[socket.id] = { id: socket.id, soc: socket, blob: msg.blob, name: msg.name };
      //ids.push(socket.id);

      sendNewPlayer(socket.broadcast, clients[socket.id]);

      for (var cl in clients) {
        sendNewPlayer(socket, clients[cl]);
      }

      interval = setInterval(function() {
        socket.emit("heartbeat", "");
      }, 100);

      socket.on("disconnect", function() {
        charm.reset();
        console.log("Client with name '" + clients[socket.id].name + "' disconnected");
        clearInterval(interval);
        socket.broadcast.emit("cmd", {
          cmd: "playerdisc",
          id: socket.id
        });
        clients[socket.id] = undefined;
        //ids.splice(ids.indexOf(socket.id), 1);
      });
    }
    else if (msg.cmd == "update")
    {
      clients[socket.id].blob = msg.blob;
      socket.broadcast.emit("cmd", {
        cmd: "playermove",
        blob: msg.blob,
        id: socket.id
      });
    }
  });
});

function sendNewPlayer(s,cl)
{
  s.emit("cmd", {
    cmd: "newplayer",
    blob: cl.blob,
    name: cl.name,
    id: cl.id
  })
}

function updateConsole(id)
{
  if (id)
  {
    var cl = clients[id];
    if (cl == undefined) return;
    console.log(cl.name + '\tx: ' + cl.blob.pos.x + "\ty: " + cl.blob.pos.y + "\tsize: " + cl.blob.radius);
  }
  else
  {
    var i = 1;
    for (var cl in clients) {
      if (clients.hasOwnProperty(cl)) {
        charm.position(0, i);
        updateConsole(cl);
        i++;
      }
    }
  }
}

setInterval(updateConsole, 200);

http.listen(3000, "0.0.0.0", function() { console.log("server start at port 3000"); });

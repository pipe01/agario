var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var charm = require('charm')();
charm.pipe(process.stdout);
charm.reset();

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var prompt = require('prompt');

function NetBlob(x, y, r, id, name, cr, cg, cb)
{
  this.x = x;
  this.y = y;
  this.r = r;
  this.id = id;
  this.name = name;
  this.dead = false;
  this.cr = cr;
  this.cg = cg;
  this.cb = cb;
  console.log(cb);
}

var blobs = [];
var food = [];
var sockets = [];
var fps = 30;
var interval = setInterval(heartbeat, (1 / fps) * 1000);
var hssent = {};

function getBlobById(id)
{
  for (var i = 0; i < blobs.length; i++) {
    if (blobs[i].id == id)
    {
      return blobs[i];
    }
  }
  return undefined;
}

var mapsize = 3000;

var bounds = {
  x: -mapsize,
  y: -mapsize,
  w: mapsize*2,
  h: mapsize*2
};

function random(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function addfood(c,soc)
{
  if (c && c > 1)
  {
    for (var i = 0; i < c; i++) {
      addfood(1,soc);
      console.log("Added food n" + i);
    }
  }
  else
  {
    var f = {
      x: random(bounds.x, bounds.x+bounds.w),
      y: random(bounds.y, bounds.y+bounds.h)
    };
    food.push(f);
    if (soc)
    {
      soc.emit("createfood", { x: f.x, y: f.y });
    }
    return f;
  }
}

addfood(300);

function heartbeat()
{
  io.emit("heartbeat", blobs);
}

app.use(express.static('public'));

io.on('connection',  function(socket){
  console.log("New client");

  socket.emit("getdata");

  socket.on("start", function(data) {
    console.log("Blob named '" + data.name + "' just connected.");

    hssent[socket.id] = undefined;

    socket.emit("setup", { mapsize: mapsize });

    var ind = blobs.push(new NetBlob(data.x, data.y, data.r, socket.id, data.name, data.cr, data.cg, data.cb));

    sockets[socket.id] = socket;

    socket.emit("clearfood");
    for (var i = 0; i < food.length; i++) {
      socket.emit("createfood", { x: food[i].x, y: food[i].y });
    }
  });

  socket.on("update", function(data) {
    var blob;
    for (var i = 0; i < blobs.length; i++) {
      if (socket.id == blobs[i].id)
      {
        blob = blobs[i];
        break;
      }
    }
    if (blob == undefined)
    {
      if (hssent[socket.id] == undefined)
      {
        socket.emit("getdata");
        hssent[socket.id] = true;
      }
    }
    else
    {
      blob.x = data.x;
      blob.y = data.y;
      blob.r = data.r;
    }
  });

  socket.on("disconnect", function() {
    for (var i = 0; i < blobs.length; i++) {
      if (blobs[i].id == socket.id)
      {
        console.log("Blob id: " + blobs[i].name + " just disconnected");
        blobs.splice(i, 1);
      }
    }
    for (var i = 0; i < sockets.length; i++) {
      if (sockets[i].id == socket.id)
      {
        sockets.splice(i, 1);
      }
    }
  });

  socket.on("eatfood", function(data) {
    for (var i = 0; i < food.length; i++) {
      if (food[i].x == data.x && food[i].y == data.y)
      {
        console.log("Eaten food at " + data.x + "," + data.y);
        food.splice(i, 1);
        io.emit("removefood", { index: i });

        var f = addfood(1, io);

        break;
      }
    }
  });

  socket.on("eatplayer", function(data) {
    for (var i = 0; i < blobs.length; i++) {
      if (blobs[i].id == data.id && !blobs[i].dead)
      {
        console.log("'" + getBlobById(socket.id).name + "' eats '" + data.name + "'");
        blobs[i].dead = true;
        sockets[data.id].emit("kill");
        break;
      }
    }
  });

});

function resetfood()
{
  food.length = 0;
  io.emit("clearfood");
}

function command()
{
  prompt.start();
  prompt.get(['command'], function (err, result) {
    if (err) { return onErr(err); }

    var values = result.command.split(' ');

    switch (values[0]) {
      case "mapsize":
        var newsize = parseInt(values[1]);
        if (values.length == 1)
        {
          console.log("Current map size is " + mapsize);
        }
        else
        {
          mapsize = newsize;

          console.log("Map size is now " + mapsize);
          io.emit("setup", { mapsize: mapsize });
          bounds = {
            x: -mapsize,
            y: -mapsize,
            w: mapsize*2,
            h: mapsize*2
          };
        }
        break;
      case "exit":
        process.exit(0);
        break;
      case "clearfood":
        resetfood();
        console.log("All food cleared");
        break;
      case "addfood":
        var am = parseInt(values[1]);
        addfood(am, io);
        console.log("Added " + am + " food");
        break;
      case "getfood":
        console.log("There are currently " + food.length + " food blobs");
        break;
      default:
    }
    command();
  });
}

http.listen(server_port, server_ip_address, function() {
  console.log("server start at port 3000");

  command();
 });

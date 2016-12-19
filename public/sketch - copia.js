var local;
var players = []
var food = [];
var zoom = 1;
var bounds = {};
var socket;
var username;
var ticks = 0;

function netsetup(url)
{
  username = window.prompt("Ingresa tu nombre");

  if (url)
  {
    socket = io(url);
  }
  else {
    socket = io();
  }


  socket.on("cmd", function(msg) {
    if (msg == "hello")
    {
      socket.emit("cmd",
      {
        cmd: "hello",
        blob: local.serialize(),
        name: username
      });
    }
    else if (msg.cmd == "newplayer")
    {
      players[msg.id] = {
        id: msg.id,
        name: msg.name,
        blob: msg.blob
      };
    }
    else if (msg.cmd == "playermove")
    {
      players[msg.id].blob = msg.blob;
    }
    else if (msg.cmd == "playerdisc")
    {
      players[msg.id] = undefined;
    }
  });

  socket.on("heartbeat", function() {
    var ser = local.serialize();
    socket.emit("cmd",
    {
      cmd: "update",
      blob: ser
    });
    ticks++;
  });
}

function setup()
{
  createCanvas(600,600);
  frameRate(30);

  local = new Blob();

  bounds.x = -width;
  bounds.y = -height;
  bounds.w = width*2;
  bounds.h = height*2;

  netsetup();

  for (var i = 0; i < 100; i++) {
    food.push(new Food());
  }
}

function draw()
{
  background(0);

  text(ticks, 5, 15);

  translate(width/2, height/2);
  var newzoom = 48 / local.radius;
  zoom = lerp(zoom, newzoom, 0.1);
  scale(zoom);
  translate(-local.pos.x, -local.pos.y);

  push();
  noFill();
  stroke(255);
  strokeWeight(5);
  rect(bounds.x, bounds.y, bounds.w, bounds.h);
  pop();

  for (var i = 0; i < food.length; i++) {
    if (local.caneat(food[i]))
    {
      local.feed(food[i].radius);
      food[i] = new Food();
    }
    food[i].draw();
  }

  for (var v in players) {
    if (players.hasOwnProperty(v) && players[v] != undefined && players[v].blob != undefined)
    {
      var pl = players[v];
      push();
      fill(0, 255, 0);
      ellipse(pl.blob.pos.x, pl.blob.pos.y, pl.blob.radius);
      pop();
    }
  }

  local.update();
  local.draw();

  ellipse(0, 0, 20);
}

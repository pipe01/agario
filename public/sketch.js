var canvas;

var food = [];
var zoom = 1;
var bounds = {};
var mapsize = 1000;

var fps = 0;

var sbdivs = [];

function setup()
{
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("holder");

  local = new Blob();

  frameRate(30);

  for (var i = 1; i < 6; i++) {
    sbdivs[i-1] = document.getElementById("sb-" + i);
  }

  netsetup();

  /*for (var i = 0; i < 100; i++) {
    food.push(new Food());
  }*/
}

function draw()
{
  if (!done)
    return;

  background(100, 100, 100);

  push();

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
    if (food[i].pos.dist(local.pos) < width)
    {
      if (local.caneat(food[i]))
      {
        local.feed(food[i].radius * 0.7);
        food[i].eaten = true;
        socket.emit("eatfood", { x: food[i].pos.x, y: food[i].pos.y });
      }
      food[i].draw();
    }
  }

  for (var i = 0; i < players.length; i++) {
    var pl = players[i];
    if (pl.id != socket.id && !pl.dead)
    {
      if (local.caneatpl(pl))
      {
        socket.emit("eatplayer", pl);
        local.feed(pl.r);
      }
      push();
      fill(pl.cr, pl.cg, pl.cb);
      ellipse(pl.x, pl.y, pl.r * 2);
      fill(255);
      textAlign(CENTER);
      text(pl.name, pl.x, pl.y);
      pop();
    }
  }

  local.update();
  local.draw();

  var sdata = {
    x: local.pos.x,
    y: local.pos.y,
    r: local.radius
  };
  socket.emit("update", sdata);

  pop();

  textSize(20);

  fill(255);
  text(Math.floor(local.radius), 5, 20);

  fill(200, 200, 0);
  text(fps + " fps", 5, 40);
}

setInterval(function() {
  fps = Math.floor(frameRate());
}, 500);

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

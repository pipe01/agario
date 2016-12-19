var socket;
var username;
var players = [];
var mapsize = 0;
var local;
var done = false;

/*var scripts = [
  "p5.min.js",
  "food.js",
  "blob.js",
  "sketch.js"
];*/

function netsetup(url)
{

  username = window.prompt("Ingresa tu nombre");

  socket = io();

  console.log(local);

  var sdata = {
    x: local.pos.x,
    y: local.pos.y,
    r: local.radius,
    cr: red(local.color),
    cg: green(local.color),
    cb: blue(local.color),
    name: username
  };


  socket.on("getdata", function() {
    socket.emit("start", sdata);
  });

  socket.on("heartbeat", function(data) {
    players = data;
  });

  socket.on("createfood", function(data) {
    food.push(new Food(data.x, data.y));
  });

  socket.on("removefood", function(data) {
    console.log("Remove food " + data.index + " at " + food[data.index].pos.x + "," + food[data.index].pos.y);
    food.splice(data.index, 1);
  });

  socket.on("clearfood", function() {
    food = [];
  });

  socket.on("kill", function() {
    alert("You died");
    location.reload();
    socket.disconnect();
  });

  socket.on("setup", function(data) {
    mapsize = data.mapsize;
    bounds.x = -mapsize;
    bounds.y = -mapsize;
    bounds.w = mapsize*2;
    bounds.h = mapsize*2;
    done = true;
  });

  socket.on("reload", function() {
    location.reload();
  });
}

function updatescoreboard()
{
  var tmp = players.slice();
  //tmp.push({ cr: local.radius, id: local.id, name: local.name });

  function compare(a,b) {
    if (a.r < b.r)
      return 1;
    if (a.r > b.r)
      return -1;
    return 0;
  }
  tmp.sort(compare);
  console.log(tmp);

  for (var i = 0; i < 5; i++) {
    var bl = tmp[i];
    if (bl == undefined || bl.name == undefined)
    {
      sbdivs[i].innerHTML = "";
      sbdivs[i].parentElement.className = "";
      continue;
    }
    sbdivs[i].innerHTML = bl.name.trim();
    console.log(bl.id + " " + socket.id);
    if (bl.id == socket.id)
    {
      console.log("same");
      sbdivs[i].parentElement.className = "you";
    }
    else
    {
      sbdivs[i].parentElement.className = "";
    }
  }
}
setInterval(updatescoreboard, 1000);

/*function loadScript(src)
{
  var sc = document.createElement("script");
  sc.type = "text/javascript";
  sc.src = src;
  document.head.appendChild(sc);
}*/

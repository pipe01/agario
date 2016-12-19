new p5();

function Blob()
{
  this.pos = createVector(width/2, height/2);
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.radius = 20;
  this.color = color(random(0, 255), random(0, 255), random(0, 255));

  this.boosting = false;
  this.boosttime = 0;

  this.serialize = function() {
    return {
      pos: { x: this.pos.x, y: this.pos.y },
      radius: this.radius,
      color: this.color
    };
  }

  this.draw = function() {
    push();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.radius * 2);
    pop();
  }

  this.update = function() {
    var newvel = createVector(mouseX-width/2,mouseY-height/2);
    newvel.setMag(3);
    //newvel.mult(40/this.radius);
    this.vel.lerp(newvel, 0.1);
    if (this.boosting)
    {
      this.vel.mult(1.2);
    }
    this.pos.add(this.vel);

    if (mouseIsPressed && !this.boosting)
    {
      this.boosting = true;
      this.boosttime = 0;
    }
    else if (!mouseIsPressed && this.boosting)
    {
      this.boosting = false;
    }

    if (this.boosting)
    {
      this.boosttime++;
      this.radius -= this.boosttime / 15;
    }

    if (this.pos.x + this.radius > bounds.x + bounds.w) //Right
    {
      this.pos.x = bounds.x + bounds.w - this.radius;
      this.vel.x = 0;
    }

    if (this.pos.x - this.radius < bounds.x) //Left
    {
      this.pos.x = bounds.x + this.radius;
      this.vel.x = 0;
    }


    if (this.pos.y + this.radius > bounds.y + bounds.h) //Bottom
    {
      this.pos.y = bounds.y + bounds.h - this.radius;
      this.vel.y = 0;
    }

    if (this.pos.y - this.radius < bounds.y)
    {
      this.pos.y = bounds.y + this.radius;
      this.vel.y = 0;
    }
  }

  this.caneat = function(food)
  {
    return (!food.eaten) && food.pos.dist(this.pos) < this.radius + food.radius;
  }

  this.caneatpl = function(pl)
  {
    return createVector(pl.x, pl.y).dist(this.pos) < this.radius + pl.r && this.radius > pl.r && !pl.dead;
  }

  this.feed = function(foodradius)
  {
    var thisarea = PI * this.radius * this.radius;
    var foodarea = PI * foodradius * foodradius;
    var totalarea = thisarea + foodarea;
    this.radius = sqrt(totalarea / PI);
    //this.radius += foodradius;
  }
}

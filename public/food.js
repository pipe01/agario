function Food(x, y)
{
  if (x && y)
  {
    this.pos = createVector(x, y);
  }
  else
  {
    this.pos = createVector(random(bounds.x, bounds.x+bounds.w), random(bounds.y, bounds.y+bounds.h));
  }
  this.radius = 20;
  this.color = color(random(20, 255), random(20, 255), random(20, 255), 255);
  this.eaten = false;

  this.draw = function()
  {
    push();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.radius);
    pop();
  }
}

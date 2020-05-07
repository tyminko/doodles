class Doodle {
  constructor (x, y, numSegments, maxSegmentLength, color, lineColor) {
    this.toShow = []
    this.segments = []
    for (let i=0; i < numSegments; i++) {
      let seg
      if (i === 0) {
        seg = new Segment(null, maxSegmentLength, random(360), color, lineColor, x, y)
      } else {
        seg = new Segment(this.segments[i-1], maxSegmentLength, random(360), color, lineColor)
        if (random() > 0.5) this.toShow.push(i)
      }
      this.segments.push(seg)
    }
  }
  setPosition (x, y) {
    this.segments[0].a.x = x
    this.segments[0].a.y = y
  }
  show (bufer) {
    this.segments.forEach((seg, i) => {
      if (i === this.segments.length - 1 || this.toShow.indexOf(i) > -1) {
        seg.show(bufer)
      } else {
        seg.calcForward()
      }
    })
  }
  drawSegments (bufer) {
    this.segments.forEach((seg, i) => {
      /* if (i > 0)  */seg.drawLine(bufer)
    })
  }
}

class Segment {
  constructor (parent, length, angle, color, lineColor, x, y) {
    this.parent = parent
    if (parent) {
      this.a = parent.b
      this.b = {} 
    } else {
      this.a = {x, y} 
      this.b = {x, y}    
    }
    this.angle = angle
    this.length = random() * length + 10
    this.lastB = {}
    this.dir = random() > 0.5 ? 1 : -1
    this.angleChange = random(-2, 2)
    if (this.angleChange === 0) this.angleChange = 0.2 * this.dir
    this.color = color
    this.lineColor = lineColor
  }
  
  calcForward () {
    this.angle += radians(this.angleChange + random(-0.5, 0.5))// * this.dir
    let angle = this.parent ? this.parent.angle + this.angle : this.angle
  
    this.b.x = this.length * Math.cos(angle) + this.a.x
    this.b.y = this.length * Math.sin(angle) + this.a.y
  }
  
  show (bufer) {
    this.calcForward()
    if (!this.parent) return
    bufer.lineWidth = random(1, 2) * window.devicePixelRatio
    bufer.strokeStyle = this.color
    if(this.lastB.x) {
      bufer.moveTo(this.lastB.x, this.lastB.y)
      bufer.lineTo(this.b.x, this.b.y)
    }
    this.lastB.x = this.b.x
    this.lastB.y = this.b.y
  }
  
  drawLine (bufer) {
    bufer.lineWidth = 1
    bufer.strokeStyle = this.lineColor
    bufer.moveTo(this.a.x, this.a.y)
    bufer.lineTo(this.b.x, this.b.y)
  }
}
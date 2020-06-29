/**
 * maxim tyminko 29.06.20.
 * maximtyminko.com
 */
class Segment {
  constructor (parent, length, angle, color, lineColor, x, y, angleDirChangeChance) {
    this.parent = parent
    if (parent) {
      this.a = parent.b
      this.b = {}
    } else {
      this.a = {x, y}
      this.b = {x, y}
    }
    this.angle = angle
    this.worldAngle = null
    this.length = random() * length + 10
    this.lastB = {}

    const a = random(2, 5)
    this.angleChange = random(-a, a)
    this.angleDir = random() > 0.5 ? 1 : -1
    this.curAngleDir = this.angleDir
    this.angleDirChangeChance = parent ? parent.angleDirChangeChance : angleDirChangeChance

    // if (this.angleChange === 0) this.angleChange = 0.2 * this.angleDir

    this.color = color
    this.lineColor = lineColor

    this.maxBoundsDiff = 200
    this.exitPoint = {x: random(0, this.maxBoundsDiff), y: random(0, this.maxBoundsDiff)}
    this.entryPointDiff = {x: random(0, this.maxBoundsDiff), y: random(0, this.maxBoundsDiff)}
  }

  calcForward () {
    if (this.curAngleDir !== this.angleDir) {
      this.curAngleDir = Math.round((this.curAngleDir + 0.05 * (this.curAngleDir > this.angleDir ? -1 : 1)) * 100) / 100
    } else {
      if (Math.random() < this.angleDirChangeChance) {
        this.angleDir *= -1
      }
    }
    this.angle += radians(this.angleChange + random(-0.5, 0.5)) * this.curAngleDir
    this.worldAngle = this.parent ? this.parent.angle + this.angle : this.angle

    this.b.x = this.length * Math.cos(this.worldAngle) + this.a.x
    this.b.y = this.length * Math.sin(this.worldAngle) + this.a.y
    const r = n => Math.round(n * 10000) / 10000
  }

  /**
   * @param {CanvasRenderingContext2D} buffer
   * @param {number} maxW
   * @param {number} maxH
   * @param {number} lineWidth
   * @return {[number, number, number]|void}
   */
  show (buffer, maxW, maxH, lineWidth) {
    this.calcForward()
    if (!this.parent) return
    const exitBounds = shrinkBoundariesByPoint(boundaries(maxW, maxH), this.exitPoint)
    if (typeof this.isOut === 'undefined') this.isOut = pointWithinBoundaries(this.b, exitBounds)

    buffer.lineWidth = random(lineWidth, lineWidth * 1.6) * window.devicePixelRatio
    buffer.strokeStyle = this.color
    if(typeof this.lastB.x !== 'undefined') {
      buffer.moveTo(this.lastB.x, this.lastB.y)

      if (this.isOut) {
        const entryBounds = shrinkBoundariesByPoint(exitBounds, this.entryPointDiff)
        if (pointWithinBoundaries(this.lastB, entryBounds)) {
          this.isOut = false
          this.exitPoint = { x: random(0, this.maxBoundsDiff), y: random(0, this.maxBoundsDiff) }
          this.entryPointDiff = { x: random(0, this.maxBoundsDiff), y: random(0, this.maxBoundsDiff) }
        }
      } else {
        if (!pointWithinBoundaries(this.b, exitBounds)) {
          this.isOut = true
        }
      }
      if (!this.isOut) {
        buffer.lineTo(this.b.x, this.b.y)
      }
    }
    this.lastB.x = this.b.x
    this.lastB.y = this.b.y
    return [this.lastB.x, this.lastB.y, buffer.lineWidth]
  }

  drawLine (buffer, maxW, maxH) {
    buffer.lineWidth = 5
    buffer.strokeStyle = this.lineColor
    // buffer.moveTo(this.a.x, this.a.y)
    // buffer.lineTo(this.b.x, this.b.y)
    buffer.moveTo(this.b.x -1, this.b.y -1)
    // buffer.arc(this.b.x, this.b.y, 20, 0, 2 * Math.PI)
    buffer.rect(this.b.x, this.b.y, 2, 2)
  }
}

/**
 * @typedef {{t:number, r:number, b:number, l:number}} Boundaries
 * @typedef {{x:number, y:number}} Point
 */

/**
 * @param {number} w
 * @param {number} h
 * @return {Boundaries}
 */
function boundaries (w, h) {
  return { t: 0, r: w, b: h, l: 0 }
}

/**
 *
 * @param {Boundaries} bounds
 * @param {Point} point
 */
function shrinkBoundariesByPoint (bounds, point) {
  return {
    t: bounds.t + point.y,
    r: bounds.r - point.x,
    b: bounds.b - point.y,
    l: bounds.l + point.x
  }
}

/**
 * @param {Point} point
 * @param {Boundaries} bounds
 * @return {boolean}
 */
function pointWithinBoundaries (point, bounds) {
  return point.x >= bounds.l && point.x <= bounds.r && point.y >= bounds.t && point.y <= bounds.b
}

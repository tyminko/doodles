class Doodle {
  constructor (x, y, numSegments, maxSegmentLength, color, lineColor) {
    this.lineWidth = random(3, 8)
    this.toShow = []
    /** @type Segment[] */
    this.segments = []
    this.record = {}
    this.angleDirChangeChance = random() > 0.6 ? random (0.01, 0.1) : 0
    for (let i=0; i < numSegments; i++) {
      let seg
      if (i === 0) {
        seg = new Segment(null, maxSegmentLength, random(360), color, lineColor, x, y, this.angleDirChangeChance)
      } else {
        seg = new Segment(this.segments[i-1], maxSegmentLength, random(360), color, lineColor)
        if (i > 1 && random() > 0.7) this.toShow.push(i)
      }
      this.segments.push(seg)
    }
  }

  /**
   * @param {number} index
   * @param {number[]=} segmentPoint
   */
  recordSegmentPointWithIndex (index, segmentPoint) {
    if (!segmentPoint) return
    const segId = `s${index}`
    if (!this.record[segId]) this.record[segId] = []
    this.record[segId].push(segmentPoint)
  }

  show (buffer, w, h) {
    this.segments.forEach((seg, i) => {
      const toShowIndex = this.toShow.indexOf(i)
      if (i === this.segments.length - 1 || toShowIndex > -1) {
        const point = seg.show(buffer, w, h, this.lineWidth)
        this.recordSegmentPointWithIndex(i, point)
      } else {
        seg.calcForward()
      }
    })
  }

  /**
   * @param {CanvasRenderingContext2D} buffer
   */
  drawOrigin (buffer) {
    if (this.segments.length) {
      const origin = this.segments[0].a
      const x = Math.floor(origin.x)
      const y = Math.floor(origin.y)
      const strokeStyle = buffer.strokeStyle
      const lineWidth = buffer.lineWidth
      const lineCap = buffer.lineCap
      const crossArm = 15
      buffer.beginPath()
      buffer.lineWidth = 3
      buffer.lineCap = 'square'
      buffer.moveTo(x - crossArm - 0.5, y - 0.5)
      buffer.lineTo(x + crossArm - 0.5, y - 0.5)
      buffer.moveTo(x - 0.5, y - crossArm - 0.5)
      buffer.lineTo(x - 0.5, y + crossArm - 0.5)
      buffer.stroke()
      buffer.strokeStyle = strokeStyle
      buffer.lineWidth = lineWidth
      buffer.lineCap = lineCap
    }
  }

  drawSegments (bufer, w, h) {
    this.segments.forEach((seg, i) => {
      /* if (i > 0)  */seg.drawLine(bufer, w, h)
    })
  }
}

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
    this.dir = random() > 0.5 ? 1 : -1
    const a = random(2, 5)
    this.angleChange = random(-a, a)
    this.angleDir = 1
    this.curAngleDir = this.angleDir
    this.angleDirChangeChance = parent ? parent.angleDirChangeChance : angleDirChangeChance

    this.angleTransitioning = false
    if (this.angleChange === 0) this.angleChange = 0.2 * this.dir
    //const hue = Math.floor(random(50, 100))
    this.color = color //`hsla(${hue}, 100%, ${Math.floor(random(80, 100))}%, 0.9)`
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

  drawLine (bufer, maxW, maxH) {
    bufer.lineWidth = 5
    bufer.strokeStyle = this.lineColor
    // bufer.moveTo(this.a.x, this.a.y)
    // bufer.lineTo(this.b.x, this.b.y)
    bufer.moveTo(this.b.x -1, this.b.y -1)
    // bufer.arc(this.b.x, this.b.y, 20, 0, 2 * Math.PI)
    bufer.rect(this.b.x, this.b.y, 2, 2)
  }
}

/**
 * @typedef {{t:number, r:number, b:number, l:number}} Boundaries
 * @typedef {{x:number, y:number}} Point
 */
/**
 *
 * @param {Point} padding
 * @param {number} fullW
 * @param {number} fullH
 */
function rectFromPaddings (padding, fullW, fullH) {
  return {
    t: padding.y,
    r: fullW - padding.x,
    b: fullH - padding.y,
    l: padding.x
  }
}

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

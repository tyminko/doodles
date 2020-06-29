class Doodle {
  constructor (x, y, numSegments, maxSegmentLength, color, lineColor, lineMinMax) {
    const lw = lineMinMax || []
    this.lineWidth = random(lw[0], lw[1])
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
        seg.show(buffer, w, h, this.lineWidth)
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

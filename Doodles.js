// © 2020 maximtyminko@gmail.com
// Doodles drawing
const Doodles = function () {
  const pxDens = window.devicePixelRatio

  let saveStateInterval = null
  let resetTimeout = null
  let justReset = false

  const showOverlay = false

  const params = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(location.search) : null

  const bg = params.get('bg')
  const lc = params.get('lc')
  let bgColor = bg ? `#${bg}` : '#fff'
  let doodleColor = lc ? `#${lc}` : 'hsla(0, 0%, 10%, 0.75)' // E6 #1A1A1AC0
  const overlayColor = 'hsla(180, 100%, 60%, 0.95)'
  const lineMinMax = [
    parseInt(params.get('lmin')) || 2,
    parseInt(params.get('lmax')) || 4
  ]

  const timeBetweenReset = { min: 30000, max: 180000 }
  const numDoodlesInRow = { min: 1, max: 5 }
  const numDoodlesInColumn = { min: 1, max: 3 }
  const numSegments = { min: 3, max: 7 }
  const segmentLengthToDistFact = 0.4

  const canvas = createCanvas('bg')
  const overlay = createCanvas('overlay')
  const ctx = canvas.getContext('2d')

  const overCtx = overlay.getContext('2d')

  /** @type Doodle[] */
  let doodles = []

  const player = new PxWebPlayer(null, overlay)
  player.onResize = () => {
    updateResolution()
    resetDoodles()
  }
  player.onPause = () => {
    clearTimeout(resetTimeout)
    clearInterval(saveStateInterval)
  }
  player.onResume = () => {
    setTimeoutForReset()
  }

  player.drawFunc = () => {
    ctx.lineCap = 'round'
    if (showOverlay) {
      overCtx.clearRect(0, 0, overlay.width, overlay.height)
      overCtx.beginPath()
    }
    doodles.forEach(doodle => {
      if (justReset) doodle.drawOrigin(ctx)
      ctx.beginPath()
      doodle.show(ctx, canvas.width, canvas.height)
      if (showOverlay) doodle.drawSegments(overCtx)
      ctx.stroke()
    })
    if (justReset) justReset = false
    if (showOverlay) overCtx.stroke()
  }

  this.init = (withDoodles = true) => {
    updateResolution()
    if (withDoodles) resetDoodles()
    player.play()
  }

  /**
   * @param {DoodleSettings} settings
   */
  this.onUpdateSettings = settings => {
    let updated = false
    if (settings.bgColor !== bgColor) {
      bgColor = settings.bgColor
      updated = true
    }
    if (settings.lineColor !== doodleColor) {
      doodleColor = settings.lineColor
      updated = true
    }
    if (settings.lineMin !== lineMinMax[0]) {
      lineMinMax[0] = parseInt(settings.lineMin)
      updated = true
    }
    if (settings.lineMax !== lineMinMax[1]) {
      lineMinMax[1] = parseInt(settings.lineMax)
      updated = true
    }
    if (updated) resetDoodles()
    player.play(!settings.pause)
  }

  function resetDoodles () {
    clearTimeout(resetTimeout)
    ctx.fillStyle = bgColor
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    overCtx.clearRect(0, 0, overlay.width, overlay.height)

    doodles = generateDoodles()
    justReset = true

    if (player.isPlating()) setTimeoutForReset()
  }

  function setTimeoutForReset () {
    let nextResetInSeconds = random(timeBetweenReset.min, timeBetweenReset.max)
      resetTimeout = setTimeout(() => {
        requestAnimationFrame(resetDoodles)
      }, nextResetInSeconds)
  }

  function setSaveStateInterval () {
    saveStateInterval = setInterval(() => {
      if (player.isPlating()) {
        if (uid && db) db.saveCurrentState(doodles)
      }
    }, 150)

  }

  function generateDoodles () {
    const numW = Math.ceil(random(numDoodlesInRow.min, numDoodlesInRow.max))
    const numH = Math.ceil(random(numDoodlesInColumn.min, numDoodlesInColumn.max))
    const winW = window.innerWidth * pxDens
    const winH = window.innerHeight * pxDens
    const distW = winW / (numW)
    const distH = winH / (numH)
    const doodles = []
    for (let x = distW/2; x < winW; x += distW) {
      for (let y = distH/2; y < winH; y += distH) {
        const max = Math.min(distW, distH) * random(0.2, 0.7)
        const offW = distW / 5
        const offH = distH / 5
        const xx = x //+ random(-offW, offW)
        const yy = y //+ random(-offH, offH)
        const numSeg = random(numSegments.min, numSegments.max)
        const maxSegmentLength = random(max/2, max)
        doodles.push(new Doodle(xx, yy, numSeg, maxSegmentLength, doodleColor, overlayColor, lineMinMax))
      }
    }
    if (uid) {
      db.saveDoodles(winW, winH, numW, numH, doodles)
    }
    return doodles
  }

  function createCanvas (id) {
    const canvas = document.createElement('canvas')
    if (id) canvas.id = id
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    document.body.appendChild(canvas)
    return canvas
  }

  function updateResolution () {
    const res = window.devicePixelRatio
    canvas.width = overlay.width = window.innerWidth * res
    canvas.height = overlay.height = window.innerHeight * res
  }

}
const dd = new Doodles()

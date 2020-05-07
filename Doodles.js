// © 2020 maximtyminko@gmail.com
// Doodles drawing
const Doodles = function () {
  const pxDens = window.devicePixelRatio

  let resetTimeout = null

  const bgColor = '#000'
  // const doodleColor = 'hsla(0, 0%, 20%, 0.8)'
  const doodleColor = 'hsla(0, 0%, 100%, 0.95)'
  const overlayColor = '#ff0000'
  const timeBetwinReset = { min: 10000, max: 180000 }
  const numDuddlesInRow = { min: 2, max: 7 } 
  const numDuddlesInColumn = { min: 1, max: 4 }
  const numSegments = { min: 4, max: 10 }
  const segmentLengthToDistFact = 0.4
  
  const canvas = createCanvas('bg')
  const overlay = createCanvas('overlay')
  const ctx = canvas.getContext('2d')

  const overCtx = overlay.getContext('2d')

  let doodles = []
  
  const player = new PxWebPlayer(null, overlay)
  player.onResize = updateResolution
  player.onPause = () => { clearTimeout(resetTimeout) }
  player.onResume = () => { setTimeoutForReset() }
  
  player.drawFunc = () => {
    overCtx.clearRect(0, 0, overlay.width, overlay.height)
    ctx.beginPath()
    ctx.lineCap = 'round'
    overCtx.beginPath()
    doodles.forEach(doodle => {
      doodle.show(ctx)
      doodle.drawSegments(overCtx)
    })
    ctx.stroke()
    overCtx.stroke()
  }
  updateResolution()
  player.play()

  function resetDoodles () {
    clearTimeout(resetTimeout)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    overCtx.clearRect(0, 0, overlay.width, overlay.height)
    doodles = generateDoodles()
    if (player.isPlating()) setTimeoutForReset()
  }

  function setTimeoutForReset () {
    let nextResetInSeconds = random(timeBetwinReset.min, timeBetwinReset.max)
      resetTimeout = setTimeout(() => {
        requestAnimationFrame(resetDoodles)
      }, nextResetInSeconds)
  }

  function generateDoodles () {
    const numW = Math.ceil(random(numDuddlesInRow.min, numDuddlesInRow.max))
    const numH = Math.ceil(random(numDuddlesInColumn.min, numDuddlesInColumn.max))
    const winW = window.innerWidth * pxDens
    const winH = window.innerHeight * pxDens
    const distW = winW / (numW)
    const distH = winH / (numH)
    const max = Math.min(distW, distH) * segmentLengthToDistFact
    const doodles = []
    for (let x = distW/2; x < winW; x += distW) {
      for (let y = distH/2; y < winH; y += distH) {
        const offW = distW / 5
        const offH = distH / 5
        const xx = x + random(-offW, offW)
        const yy = y + random(-offH, offH)
        const numSeg = random(numSegments.min, numSegments.max)
        const maxSegmentLength = random(max/2, max)
        doodles.push(new Doodle(xx, yy, numSeg, maxSegmentLength, doodleColor, overlayColor))
      }
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
    resetDoodles()
  }

}
new Doodles()

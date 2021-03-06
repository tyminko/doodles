/**
 Drawing #12549, 4 Doodles (2x2):

  1 │ 2
 ───┼───
  3 │ 4

 1: Doodle #12549-1 (top-left)
    Virtual drawing devise: A chain of 3 spinning line-segments with a fixed origin and
    2 drawing points on the vertices of the 2nd and 5th segments.
    Probability of a spin flip for each segment less than 10%

    A          B           A          D
    |⟵45.79⟶|⟵56.45⟶|⟵34.00⟶|
                           ✐         ✐
    ⤾ 0.2°     ⤿ -2.34°   ⤿ -0.34°  .
    x: 65.34   x: 12.34    x: 12.34   x:12.34
    y: 44.22   y:  5.22    y:  5.22   y: 5.22

 */
/**
 * @typedef {{
 *  bgColor: string,
 *  lineColor: string,
 *  lineMin: number,
 *  lineMax: number,
 *  pause: boolean
 * }[]} DoodleSettings
 *
 * @typedef {{
 *  spin: number,
 *  x: number,
 *  y: number
 * }[]} SegmentState
 *
 * @typedef {SegmentState[][]} DrawingState
 *
 * @typedef {{
 *  length: number
 * }} SegmentData
 *
 * @typedef {{
 *  probabilitySpinFlip: number,
 *  drawingPoints: number[],
 *  segments: SegmentData[],
 *  order: number
 * }} DoodleData
 *
 * @typedef {{
 *  number: number,
 *  width: number,
 *  height: number,
 *  columns: number,
 *  rows: number,
 *  doodles: DoodleData[]
 * }} DrawingData
 *
 */
function DB () {
  const firebaseConfig = {
    apiKey: "AIzaSyDHIJbOtxWHs-79n04xifJCvkuUEqbxvjQ",
    authDomain: "doodles-sync.firebaseapp.com",
    databaseURL: "https://doodles-sync.firebaseio.com",
    projectId: "doodles-sync",
    storageBucket: "doodles-sync.appspot.com",
    messagingSenderId: "601337200849",
    appId: "1:601337200849:web:bbc677a6cd5fa8200445f0"
  };
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database()
  const auth = firebase.auth()
  let versionRef = null

  this.auth = callback => {
    const ps = (location.hash || '').substring(1)
    // !!! DEBUG !!!
    console.log(`%c auth() %c ps: `, 'background:#ffbb00;color:#000', 'color:#00aaff', ps)
    if (!ps) {
      if(typeof callback === 'function') callback(null)
      return
    }

    auth.onAuthStateChanged(function(user) {
      if (user) {
        if(typeof callback === 'function') callback(user)
      } else {
        if(typeof callback === 'function') callback(null)
      }
    })

    auth.signInWithEmailAndPassword('tyminko@gmail.com', ps)
      .catch(function(error) {
        console.error(`%c AUTH %c error: `, 'background:#ffbb00;color:#000', 'color:#00aaff', error)
      })
  }

  this.getLastDrawingNumber = () => {
    return database.ref(`/connections/${uid}`)
      .once('value')
      .then(snapshot => {
        return (snapshot.val() && snapshot.val().number) || 0;
      })
  }

  this.listenToSettings = callback => {
    return database.ref(`/settings/doodles`)
      .on('value', snapshot => {
        if (typeof callback === 'function') callback(snapshot.val())
      })
  }


  /**
   * @param {Doodle[]} doodles
   */
  this.saveCurrentState = (doodles) => {
    const state = doodles.map(doodle => {
      return doodle.segments.map((segment, i) => {
        const segState = {
          spin: segment.angle || 0,
          x: segment.a.x || 0,
          y: segment.a.y || 0
        }
        if (i === doodle.segments.length - 1) {
          segState.xEnd = segment.b.x || 0
          segState.yEnd = segment.b.y || 0
        }
        return segState
      })
    })
    return database.ref(`/states/${uid}`).set(state)
  }

  /**
   * @param {number} w
   * @param {number} h
   * @param {number} cols
   * @param {number} rows
   * @param {Doodle[]} doodles
   */
  this.saveDoodles = (w, h, cols, rows, doodles) => {
    lastDrawingNumber += 1
    const data = {
      number: lastDrawingNumber,
      width: w,
      height: h,
      columns: cols,
      rows: rows,
      doodles: doodles.map((doodle, i) => doodleToDoodleData(doodle, i))
    }
    return database.ref(`/connections/${uid}`).set(data)
  }

  /**
   * @param {Doodle} doodle
   * @param {number} index
   * @return {DoodleData}
   */
  function doodleToDoodleData (doodle, index) {
    return {
      order: index,
      origin: doodle.segments[0].a,
      probabilitySpinFlip: doodle.angleDirChangeChance,
      drawingPoints: doodle.toShow,
      segments: doodle.segments.map((segment, i) => segmentToSegmentData(segment, i))
    }
  }

  /**
   * @param {Segment} segment
   * @param {number} index
   * @return {SegmentData}
   */
  function segmentToSegmentData (segment, index) {
    return {
      origAngle: segment.angle,
      length: segment.length,
      angleDir: segment.angleDir,
      angleChange: segment.angleChange
    }
  }
}

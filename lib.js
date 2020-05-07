const RAD_TO_DEG = 180.0 / Math.PI
const DEG_TO_RAD = Math.PI / 180.0

function random(min, max) {
  const rand = Math.random()
  if (typeof min === 'undefined') {
    return rand;
  } else if (typeof max === 'undefined') {
    if (min instanceof Array) {
      return min[Math.floor(rand * min.length)];
    } else {
      return rand * min;
    }
  } else {
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }
    return rand * (max - min) + min;
  }
}

function radians (angle) { return angle * DEG_TO_RAD }

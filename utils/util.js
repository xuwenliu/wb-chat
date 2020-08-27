const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var EARTH_RADIUS = 6378137.0;
var PI = Math.PI;
function getRad(d) {
  return d * PI / 180.0;
}

const getDistance = (startLoc, endLoc) => {
  var f = getRad((startLoc.lat * 1 + endLoc.lat * 1) / 2);
  var g = getRad((startLoc.lat * 1 - endLoc.lat * 1) / 2);
  var l = getRad((startLoc.lng * 1 - endLoc.lng * 1) / 2);

  var sg = Math.sin(g);
  var sl = Math.sin(l);
  var sf = Math.sin(f);

  var s, c, w, r, d, h1, h2;
  var a = EARTH_RADIUS;
  var fl = 1 / 298.257;

  sg = sg * sg;
  sl = sl * sl;
  sf = sf * sf;

  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;

  w = Math.atan(Math.sqrt(s / c));
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3 * r - 1) / 2 / c;
  h2 = (3 * r + 1) / 2 / s;

  let distance = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
  if (distance < 1000){
    return distance.toFixed(1) + "m";
  }else if (distance > 1000){
    return (Math.round(distance / 100) / 10).toFixed(1) + "km";
  }
};

module.exports = {
  formatTime: formatTime,
  getDistance: getDistance
}

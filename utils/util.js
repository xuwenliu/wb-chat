const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join("/") +
    " " +
    [hour, minute, second].map(formatNumber).join(":")
  );
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : "0" + n;
};

var EARTH_RADIUS = 6378137.0;
var PI = Math.PI;
function getRad(d) {
  return (d * PI) / 180.0;
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
  if (distance < 1000) {
    return distance.toFixed(1) + "m";
  } else if (distance > 1000) {
    return (Math.round(distance / 100) / 10).toFixed(1) + "km";
  }
};

const filterDate = (date, fmt = "YYYY-MM-DD HH:mm") => {
  if (!date) {
    return "";
  }
  if (typeof date === "number") {
    date = new Date(date * 1000);
  }
  var o = {
    "M+": date.getMonth() + 1,
    "D+": date.getDate(),
    "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
    "H+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  var week = {
    0: "\u65e5",
    1: "\u4e00",
    2: "\u4e8c",
    3: "\u4e09",
    4: "\u56db",
    5: "\u4e94",
    6: "\u516d",
  };
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (RegExp.$1.length > 1
        ? RegExp.$1.length > 2
          ? "\u661f\u671f"
          : "\u5468"
        : "") + week[date.getDay() + ""]
    );
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
};
export function throttle(func, wait) {
  let timeout;
  return function () {
    let that = this;
    let args = arguments;

    if (!timeout) {
      timeout = setTimeout(function () {
        timeout = null;
        func.apply(that, args);
      }, wait);
    }
  };
}
export function formatDuration(time) {
  let interval = time;
  let continued = "";
  if (interval > 3600) {
    const hour = Math.floor(interval / 3600);
    continued += hour + "小时";
    interval -= hour * 3600;
  }
  if (interval > 60 && interval < 3600) {
    const min = Math.floor(interval / 60);
    continued += min + "分";
    interval -= min * 60;
  }
  if (interval < 60) {
    continued += Math.floor(interval) + "秒";
  }
  return continued;
}

module.exports = {
  formatTime: formatTime,
  filterDate: filterDate,
  throttle: throttle,
  formatDuration: formatDuration,
  getDistance: getDistance,
};

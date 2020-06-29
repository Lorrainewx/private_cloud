import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export const isUrl = path => reg.test(path);
export const isAntDesignPro = () => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }

  return window.location.hostname === 'preview.pro.ant.design';
}; // 给官方演示站点用，用于关闭真实开发环境不需要使用的特性

export const isAntDesignProOrDev = () => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    return true;
  }

  return isAntDesignPro();
};
export const getPageQuery = () => parse(window.location.href.split('?')[1]);
/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */

export const getAuthorityFromRouter = (router = [], pathname) => {
  const authority = router.find(
    ({ children, path = '/' }) =>
      (path && pathRegexp(path).exec(pathname)) ||
      (children && getAuthorityFromRouter(children, pathname)),
  );

  if (authority && authority.authority) return authority;
  return undefined;
};
export const getRouteAuthority = (path, routeData) => {
  let authorities;
  routeData.forEach(route => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      } // exact match

      if (route.path === path) {
        authorities = route.authority || authorities;
      } // get children authority recursively

      if (route.children) {
        authorities = getRouteAuthority(path, route.children) || authorities;
      }
    }
  });
  return authorities;
};
// 时间戳转换格式 2019-08-12 15:50
export const timestampToTime = modifyTime => {
  var date = new Date(modifyTime);
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + ' ' + h + m + s;
}
// 时间戳转换格式 2 2019/08/12 HH:mm:ss
export const timestampToTime2 = modifyTime => {
  var date = new Date(modifyTime);
  var Y = date.getFullYear() + '/';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + ' ' + h + m + s;
}
// 单位换算
export const unitConversion = fileSize => {
  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;
  const t = gb * 1024;
  let size = Math.abs(fileSize);
  let desp = '--';
  if (size < 1 * kb) {
    size < 0.1 ? '0' : size;
    desp = size + 'B';
  } else if (size >= 1 * kb && size < 1 * mb) {
    size = parseFloat((fileSize / kb).toFixed(2));
    desp = size + 'K';
  } else if (size >= 1 * mb && size < 1 * gb) {
    size = parseFloat((fileSize / mb).toFixed(2));
    desp = size + 'M';
  } else if (size >= 1 * gb && size < 1 * t) {
    size = parseFloat((fileSize / gb).toFixed(2));
    desp = size + 'G';
  } else if (size >= 1 * t) {
    size = parseFloat((fileSize / t).toFixed(2));
    desp = size + 'T';
  }
  return desp;
};

// 获取cookie
export const getCookie = (cookieName) => {
  const cookieStr = document.cookie;
  const cookieArr = cookieStr.split(';');
  for (let i = 0; i < cookieArr.length; i++) {
    let arr = cookieArr[i].split("=");
    //找到名称为userId的cookie，并返回它的值
    if (cookieName == arr[0]) {
      return arr[1];
    }
  }
  return false;
}

// base64解密
export const Base64_decode = encodedData => {
  const decodeUTF8string = function (str) {
    return decodeURIComponent(str.split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  };

  if (typeof window !== 'undefined') {
    if (typeof window.atob !== 'undefined') {
      return decodeUTF8string(window.atob(encodedData));
    }
  } else {
    return new Buffer(encodedData, 'base64').toString('utf-8');
  }
  const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    dec = '',
    tmpArr = [];
  if (!encodedData) {
    return encodedData;
  }
  encodedData += '';
  do {
    // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(encodedData.charAt(i++));
    h2 = b64.indexOf(encodedData.charAt(i++));
    h3 = b64.indexOf(encodedData.charAt(i++));
    h4 = b64.indexOf(encodedData.charAt(i++));
    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
    o1 = bits >> 16 & 0xff;
    o2 = bits >> 8 & 0xff;
    o3 = bits & 0xff;
    if (h3 === 64) {
      tmpArr[ac++] = String.fromCharCode(o1);
    } else if (h4 === 64) {
      tmpArr[ac++] = String.fromCharCode(o1, o2);
    } else {
      tmpArr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < encodedData.length);
  dec = tmpArr.join('');
  return decodeUTF8string(dec.replace(/\0+$/, ''));
};


export const jsonToArray = (nodes) => {
  var r = [];
  if (Array.isArray(nodes)) {
    for (var i = 0, l = nodes.length; i < l; i++) {
      r.push(nodes[i]); // 取每项数据放入一个新数组
      if (Array.isArray(nodes[i]["children"]) && nodes[i]["children"].length > 0)
        // 若存在children则递归调用，把数据拼接到新数组中，并且删除该children
        r = r.concat(jsonToArray(nodes[i]["children"]));
      delete nodes[i]["children"]
    }
  }
  return r;
}

export const generateUuid = (len, radix) => {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [], i;
  radix = radix || chars.length;

  if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
          if (!uuid[i]) {
              r = 0 | Math.random() * 16;
              uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
          }
      }
  }

  return uuid.join('');
}

export const attributeCount = (obj) => {
  let count = 0;
  for(let i in obj) {
    if(obj.hasOwnProperty(i)) {  // 建议加上判断,如果没有扩展对象属性可以不加
        count++;
    }
  }
  return count;
}

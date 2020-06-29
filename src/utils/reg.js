
// 非法字符验证 
// const isIllegal = /^[^!@#$^*<>?']{1,20}$/;
const isIllegal = /^[^/:|*<>""?]{1,20}$/;
export const isIllegalStr = value => {
  if (isIllegal.test(value)) {
    return true;
  }
  return false;
}

// 非法字符验证2
const isIllegal2 = /^[^!@#$^*<>_{}|+=“”‘’""'',。，%&*?']{1,1000}$/;
export const isIllegalStr2 = value => {
  if (isIllegal2.test(value)) {
    return true;
  }
  return false;
}

// 空格验证
const blankReg = /^[ ]*$/;
export const isBlankReg = value => blankReg.test(value);

// 企业邮箱
const isEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
export const isEmailStr = (value) => {
  if (isEmail.test(value)) {
    return true;
  }
  return false;
}

//企业官网
const isWebUrl = /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*$/;
export const isWebUrlStr = value => {
  if (isWebUrl.test(value)) {
    return true;
  }
  return false;
}

// 企业地址
const isAdd = /^(?![A-Za-z0-9]+$)[\u4e00-\u9fa5A-Za-z0-9]{3,40}$/;
export const isAddStr = value => {
  if (isAdd.test(value)) {
    return true;
  }
  return false;
}

// 姓名
const isName = /^(?![A-Za-z0-9]+$)[\u4e00-\u9fa5A-Za-z0-9]{1,20}$/;
export const isNameStr = value => {
  if (isName.test(value)) {
    return true;
  }
  return false;
}

// 联系方式
const isTel = /^0\d{2,3}-?\d{7,8}$/;
const isPhone = /^1[3456789]\d{9}$/;
export const isContactStr = value => {
  if (isTel.test(value) || isPhone.test(value)) {
    return true;
  }
  return false;
}

// 手机验证
export const isPhoneStr = value => {
  if (isPhone.test(value)) {
    return true;
  }
  return false;
}

// 纯数字
const isNum = /^[0-9]*$/;
export const isNumStr = value => {
  if (isNum.test(value)) {
    return true;
  }
  return false;
}

// 成员密码  ^[a-z]+$
const isPw = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/;
export const isPwStr = value => {
  if (isPw.test(value)) {
    return true;
  }
  return false;
}

// 部门名称
const dpname = /^[\u4e00-\u9fa5-（）、a-zA-Z0-9]+$/;
export const isDpnameStr = value => {
  if (dpname.test(value)) {
    return true;
  }
  return false;
}


// 登录账号
const isAccount = /^([0-9a-zA-Z]){1,20}$/;
export const isAccountStr = value => {
  if (isAccount.test(value)) {
    return true;
  }
  return false;
}
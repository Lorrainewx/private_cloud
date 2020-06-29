import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}
export async function queryCurrent() {
  return request('/api/currentUser');
}
export async function queryNotices() {
  return request('/api/notices');
}

export async function getUserInfo() {
  return request('/epauth/api/account/userinfo');
}

export async function isUserSignin() {
  return request('/epdrive/user/isUserSignIn');
}

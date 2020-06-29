import request from '@/utils/request';
import { stringify } from 'qs';

export async function getFakeCaptcha(mobile) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function accountLogin(params) {
  return request(`/epauth/api/account/login?${stringify(params)}`, {
    method: 'POST',
  })
}

export async function logout() {
  return request('/epauth/api/account/logout');
}


import { stringify } from 'querystring';
import { history } from 'umi';
import { accountLogin, logout } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { RESULT_STATUS } from '@/const/STATUS';
import defaultSettings from '../../config/defaultSettings';
import PomeloClient from '@/utils/pomelo/pomeloClient';

const { devAuth } = defaultSettings;

const Model = {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(accountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      }); // Login successfully
      
      if (response && response.code == RESULT_STATUS.SUCCESS) {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        
        if (redirect) {
          const redirectUrlParams = new URL(redirect);

          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);

            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }

        history.replace(redirect || '/');

        // yield put({
        //   type: 'enterprise/fetch',
        // });

      }
    },

    *logout({ payload, callback }, { call, put }) {
      const response = yield call(logout, payload);
      yield put({
        type: 'save',
        payload: response,
      }); // Loginout successfully
      const { redirect } = getPageQuery(); // Note: There may be security issues, please note      
      if (window.location.pathname !== '/user/login' && !redirect) {
        // window.location.href = `${devAuth}/login/login.html`;
        history.replace({
          pathname: '/user/login',
        });
      }

      yield put({
        type: 'menus/clear',
      })
      callback && typeof callback == 'function' && callback();
      localStorage.clear();
      PomeloClient.disconnect();
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      payload && payload.code == RESULT_STATUS.SUCCESS ? setAuthority(payload.data.role) : setAuthority('guest');
      return { ...state, status: payload.status, type: payload.type };
    },
  },
};
export default Model;

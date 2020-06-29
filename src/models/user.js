import { getUserInfo, isUserSignin } from '@/services/user';

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {},
    isUserSiginInfo: {},
  },
  effects: {
    *fetchCurrent({_, callback}, { call, put }) {
      const response = yield call(getUserInfo);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
      callback && typeof callback == 'function' && callback(response);
    },
    *isLogin(_, { call, put }) {
      const response = yield call(isUserSignin);
      yield put({
        type: 'save',
        payload: response,
      })     

      
      yield put({
        type: 'account/getToken'
      })
    }
  },
  reducers: {
    saveCurrentUser(state, action) {
      return { ...state, currentUser: action.payload || {} };
    },
    save(state, action) {
      return { ...state, isUserSiginInfo: action.payload || {} };
    }
  },
};
export default UserModel;

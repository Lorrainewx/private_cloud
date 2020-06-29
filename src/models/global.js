import { getEnterpriseInfo } from '@/services/global';

const GlobalModel = {
  namespace: 'global',
  state: {
    collapsed: false,
    notices: [],
    epInfo: {},
    epLogo: "",
  },
  effects: {
    *fetchEpInfo(_, { call, put }) {
      const response = yield call(getEnterpriseInfo);
      yield put({
        type: 'saveEp',
        payload: response,
      })
    },
  },
  reducers: {
    changeLayoutCollapsed(
      state = {
        notices: [],
        collapsed: true,
      },
      { payload },
    ) {
      return { ...state, collapsed: payload };
    },
    saveEp(state, action) {
      return { ...state, epInfo: { ...action.payload, logo: `/epauth/api/corp/logo?time=${new Date().getTime()}` } || {} };
    },
  },
  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
export default GlobalModel;

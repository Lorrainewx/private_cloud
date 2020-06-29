import {getNoticeList,addWithPublish,noticeInfo,deleteNotice,edit,noticeLookInfo,batchDel} from '../services/notice'

const noticeModel ={
  namespace: 'notice',
  state: {
    noticeList:{},
    addResult: {},
    noticeInfo:{},
    deleteResult:{},
    confirmData:{},
    batchDelResult:{}
  },
  effects:{
    *getNoticeList({payload,callback}, { call, put }) {
      const response = yield call(getNoticeList, payload);
      console.log('getNoticeLists response:',response)
      yield put({
        type: 'save',
        payload: {
          noticeList:response.data
        },
      });
      if(callback && typeof(callback) == 'function'){
        callback(response);
      }
  },
    *addWithPublish({payload,callback}, { call, put }) {
      console.log('请求参数：', payload);
      const response = yield call(addWithPublish, payload);
      yield put({
        type: 'save',
        payload: {
          addResult:response
        },
      });
      if(callback && typeof(callback) == 'function'){
        callback(response);
      }
    },
    *deleteNotice({payload,callback}, { call, put }) {
      const response = yield call(deleteNotice, payload);
      yield put({
        type: 'save',
        payload: {
         deleteResult:response
        },
      });
      if(callback && typeof(callback) == 'function'){
        callback(response);
      }
    },
    *noticeInfo({payload,callback}, { call, put }) {
      const response = yield call(noticeInfo, payload);
      yield put({
        type: 'save',
        payload: {
          noticeInfo:response.data
        },
      });
      if(callback && typeof(callback) == 'function'){
        callback(response);
      }
    },
    *noticeEdit({payload,callback}, { call, put }) {
      const response = yield call(edit, payload);
      yield put({
        type: 'save',
        payload: {
          noticeInfo:response
        },
      });
      if(callback && typeof(callback) == 'function'){
        callback(response);
      }
    },
    *noticeLookInfo({payload,callback}, { call, put }) {
      const response = yield call(noticeLookInfo, payload);
      yield put({
        type: 'save',
        payload:{
          confirmData:response.data,
        }
      });
      if(callback && typeof(callback) == 'function'){
        callback(response);
      }
    },
    *batchDel({payload,callback}, { call, put }) {
      const response = yield call(batchDel, payload);
      yield put({
        type: 'save',
        payload:{
          batchDelResult:response,
        }
      });
      if(callback && typeof(callback) == 'function'){
        callback(response);
      }
    }
  },
  reducers:{
    save(state, action) {
      return { ...state, ...action.payload };
    },
    update(state,action){
      const {noticeList} = action.payload
      return { ...state, ...action.payload,noticeList:noticeList };
    }
  }

}
export  default noticeModel

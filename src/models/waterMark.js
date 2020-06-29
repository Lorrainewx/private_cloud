/*
水印管理
 20200610 by wl
 */

import {modifyWaterMark,getEnterpriseWaterMark,PreviewWaterMark} from '../services/waterMark'

const waterMarkModel = {
  namespace:'watermarks',
  state:{
    data:'',
    waterMarkInfo:{},
  },
  effects:{
    *getEnterpriseWaterMark({payload,callback},{call,put}){
      const response = yield call(getEnterpriseWaterMark,payload);
      yield put({
        type:'save',
        payload:{
          waterMarkInfo:response
        }
      })
      if(callback && typeof callback == 'function'){
        callback(response);
      }
    },
    *modifyWaterMark({payload,callback},{call,put}){
      const response = yield call(modifyWaterMark,payload);
      yield put({
        type:'save',
        payload:{
          data:response
        }
      })
      if(callback && typeof callback == 'function'){
        callback(response);
      }
    },
    *PreviewWaterMark({payload,callback},{call,put}){
      const response = yield call(PreviewWaterMark,payload);
      yield put({
        type:'save',
        payload:{
          data:response
        }
      })
      if(callback && typeof callback == 'function'){
        callback(response);
      }
    },

  },
  reducers:{
    save(state,action){
      return{
        ...state,
        ...action.payload
      }
    }
  }
}

export  default  waterMarkModel;

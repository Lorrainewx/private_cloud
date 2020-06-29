import {
    previewFile,
    downloadFiles,
} from '@/services/file';

const FileModel = {
    namespace: 'file',
    state: {
        previewUrl: {},
        downloadUrl: {},
    },
    effects: {        
        *preview({ payload, callback }, { call, put }) {
            const response = yield call(previewFile, payload);
            yield put({
                type: 'save',
                payload: {
                    previewUrl: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *download({ payload, callback }, { call, put }) {
            const response = yield call(downloadFiles, payload);
            yield put({
                type: 'save',
                payload: {
                    downloadUrl: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
    },
    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    }

}

export default FileModel;
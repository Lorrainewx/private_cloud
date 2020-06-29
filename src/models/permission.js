import {
    addRole,
    deleteRole,
} from '@/services/permission';

const PacketModel = {
    namespace: 'permission',
    state: {
        addResult: {},
        deleteResult: {},
    },
    effects: {        
        *addRole({ payload, callback }, { call, put }) {
            const response = yield call(addRole, payload);
            yield put({
                type: 'save',
                payload: {
                    addResult: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *deleteRole({ payload, callback }, { call, put }) {
            const response = yield call(deleteRole, payload);
            yield put({
                type: 'save',
                payload: {
                    deleteResult: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
    },
    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    }
};

export default PacketModel;

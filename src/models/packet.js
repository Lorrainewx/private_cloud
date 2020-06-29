import {
    queryPacketList,
    queryPacketMembers,
    transferPacket,
    getPacketSpaceUsed,
    getPacketBulletins,
    getPacketTotal,
    deletePackets,
    modifyPacketSpaceLimit,
} from '@/services/packet';

const PacketModel = {
    namespace: 'packet',
    state: {
        packetsResult: {},  // 群组列表
        packetMembers: {},  // 群组成员列表
        transferResult: {}, // 移交
        spaceResult: {},    //群组空间使用情况
        noticesResult: {},  // 公告列表
        packetTotal: {},    //总数
        deleteResult: {},   //删除
        modifySpaceLimit: {},   //群组空间上限
    },
    effects: {
        *fetch({ payload, callback }, { call, put }) {
            const response = yield call(queryPacketList, payload);
            yield put({
                type: 'save',
                payload: {
                    packetsResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *fetchMembers({ payload, callback }, { call, put }) {
            const response = yield call(queryPacketMembers, payload);
            yield put({
                type: 'save',
                payload: {
                    packetMembers: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *transfer({ payload, callback }, { call, put }) {
            const response = yield call(transferPacket, payload);
            yield put({
                type: 'save',
                payload: {
                    transferResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },        
        *fetchSpaceUsed({ payload, callback }, { call, put }) {
            const response = yield call(getPacketSpaceUsed, payload);
            yield put({
                type: 'save',
                payload: {
                    spaceResult: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *fetchNotices({ payload, callback }, { call, put }) {
            const response = yield call(getPacketBulletins, payload);
            yield put({
                type: 'save',
                payload: {
                    noticesResult: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *fetchTotal({ payload, callback }, { call, put }) {
            const response = yield call(getPacketTotal, payload);
            yield put({
                type: 'save',
                payload: {
                    packetTotal: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },        
        *delete({ payload, callback }, { call, put }) {
            const response = yield call(deletePackets, payload);
            yield put({
                type: 'save',
                payload: {
                    deleteResult: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *spaceLimit({ payload, callback }, { call, put }) {
            const response = yield call(modifyPacketSpaceLimit, payload);
            yield put({
                type: 'save',
                payload: {
                    modifySpaceLimit: response
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
}

export default PacketModel;
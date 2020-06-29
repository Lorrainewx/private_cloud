
import {
    createMember,
    queryMembers,
    deleteMember,
    getMemInfo,
    addAlreadyUsers,
    updateUserInfo,
    changeAccountState,
    moveUsers,
    moveDepartment,
    resetPwd,
} from '@/services/corpAccount';

const CorpAccountModel = {
    namespace: 'corpAccount',
    state: {
        creatememberResult: {},
        membersResult: {},
        deleteResult: {},
        memberInfo: {},
        addUsersResult: {},
        updateResult: {},
        changeAcResult: {},
        moveResult: {},
        moveDepartmentResult: {},
        resetPwdResult: {},
    },
    effects: {
        *create({ payload, callback }, { call, put }) {
            const response = yield call(createMember, payload);
            yield put({
                type: 'save',
                payload: {
                    creatememberResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *fetchMembers({ payload, callback }, { call, put }) {
            const response = yield call(queryMembers, payload);
            yield put({
                type: 'save',
                payload: {
                    membersResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *deleteMember({ payload, callback }, { call, put }) {
            const response = yield call(deleteMember, payload);
            yield put({
                type: 'save',
                payload: {
                    deleteResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *fetchMemInfo({ payload, callback }, { call, put }) {
            const response = yield call(getMemInfo, payload);
            yield put({
                type: 'save',
                payload: {
                    memberInfo: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *addUsers({ payload, callback }, { call, put }) {
            const response = yield call(addAlreadyUsers, payload);
            yield put({
                type: 'save',
                payload: {
                    addUsersResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *updateUser({ payload, callback }, { call, put }) {
            const response = yield call(updateUserInfo, payload);
            yield put({
                type: 'save',
                payload: {
                    updateResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *changeAccountState({ payload, callback }, { call, put }) {
            const response = yield call(changeAccountState, payload);
            yield put({
                type: 'save',
                payload: {
                    changeAcResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *moveUsers({ payload, callback }, { call, put }) {
            const response = yield call(moveUsers, payload);
            yield put({
                type: 'save',
                payload: {
                    moveResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *resetPwd({ payload, callback }, { call, put }) {
            const response = yield call(resetPwd, payload);
            yield put({
                type: 'save',
                payload: {
                    resetPwdResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },        
        *moveDp({ payload, callback }, { call, put }) {
            const response = yield call(moveDepartment, payload);
            yield put({
                type: 'save',
                payload: {
                    moveDepartmentResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *clear(_, { put }) {
            yield put({
                type: 'save',
                payload: {
                    membersResult: {}
                }
            })
        },
        *clearUser(_, { put }) {
            yield put({
                type: 'save',
                payload: {
                    memberInfo: {}
                }
            })
        },
    },
    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    }

}

export default CorpAccountModel;
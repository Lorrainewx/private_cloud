import {
    getAdminmembersList,
    deleteMember,
    addAdmin,
    getMenus,
    getMenuConfig,
    addNewRole,
    deleteRole,
    roleConfig,
    getToken,
} from '@/services/account';

const AccountModel = {
    namespace: 'account',
    state: {
        adminMembersList: {},
        deleteResult: {},
        addResult: {},
        currentMenus: {},
        menuConfig: {},
        newRole: {},
        deleteRole: {},
        roleConfig: {},
        token: {},
    },
    effects: {
        *fetchMembers({ payload, callback }, { call, put }) {
            const response = yield call(getAdminmembersList, payload);
            yield put({
                type: 'save',
                payload: {
                    adminMembersList: response
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
        *addAdmin({ payload, callback }, { call, put }) {
            const response = yield call(addAdmin, payload);
            yield put({
                type: 'save',
                payload: {
                    addResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *getMenus({ payload, callback }, { call, put }) {
            const response = yield call(getMenus, payload);
            yield put({
                type: 'save',
                payload: {
                    currentMenus: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *menuConfig({ payload, callback }, { call, put }) {
            const response = yield call(getMenuConfig, payload);
            yield put({
                type: 'save',
                payload: {
                    menuConfig: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *addNewRole({ payload, callback }, { call, put }) {
            const response = yield call(addNewRole, payload);
            yield put({
                type: 'save',
                payload: {
                    newRole: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *deleteRole({ payload, callback }, { call, put }) {
            const response = yield call(deleteRole, payload);
            yield put({
                type: 'save',
                payload: {
                    deleteRole: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *roleConfig({ payload, callback }, { call, put }) {
            const response = yield call(roleConfig, payload);
            yield put({
                type: 'save',
                payload: {
                    roleConfig: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *getToken({ payload, callback }, { call, put }) {
            const response = yield call(getToken, payload);
            yield put({
                type: 'save',
                payload: {
                    token: response
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

export default AccountModel;
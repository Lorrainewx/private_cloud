import {
    updateEnterpriseInfo,
    getDepartmentList,
    createDepartment,
    dropDepartment,
    getDepartmentDetailInfo,
    getCorpRoles,
    updateDepartment,
    getMembersNum,
    getDepartmentMemberList,
    getEnterPriseDrive,
    updateVersionLimit,
    getAdminRoles,
    getEnterpriseDepartmentFileCount,
} from '@/services/enterprise';

const EpModel = {
    namespace: 'enterprise',
    state: {
        enterpriseResult: {},   //epdrive 企业信息
        updateResult: {},   // 修改企业
        updateVLResult: {}, //企业 文件历史版本
        departments: {},    // 部门列表
        dpMembers: {},  // 部门列表带成员
        createResult: {},   // 新增
        dropResult: {}, // 删除
        curDepartment: {},  // 当前部门
        corpRoles: {},   //当前角色列表
        updateDpResult: {},   // 部门更新结果
        membersNumResult: {},  // 部门成员信息
        adminRoles: {},  // 管理员角色
        epDepartmentFileCount: {},  // 一级部门文档数量
    },
    effects: {
        *fetch({ payload, callback }, { call, put }) {
            const response = yield call(getEnterPriseDrive, payload);
            yield put({
                type: 'save',
                payload: {
                    enterpriseResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *update({ payload, callback }, { call, put }) {
            const response = yield call(updateEnterpriseInfo, payload);
            yield put({
                type: 'save',
                payload: {
                    updateResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *updateVersionLimit({ payload, callback }, { call, put }) {
            const response = yield call(updateVersionLimit, payload);
            yield put({
                type: 'save',
                payload: {
                    updateVLResult: response
                },
            })

            if (callback && typeof callback == 'function') callback(response);
        },
        *fetchDepartments({ payload, callback }, { call, put }) {
            const response = yield call(getDepartmentList, payload);
            yield put({
                type: 'save',
                payload: {
                    departments: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *fetchDepartmentsMemberList({ payload, callback }, { call, put }) {
            const response = yield call(getDepartmentMemberList, payload);
            yield put({
                type: 'save',
                payload: {
                    dpMembers: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *createDepartment({ payload, callback }, { call, put }) {
            const response = yield call(createDepartment, payload);
            yield put({
                type: 'save',
                payload: {
                    createResult: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *dropDepartment({ payload, callback }, { call, put }) {
            const response = yield call(dropDepartment, payload);
            yield put({
                type: 'save',
                payload: {
                    dropResult: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *fetchDepartment({ payload, callback }, { call, put }) {
            const response = yield call(getDepartmentDetailInfo, payload);
            yield put({
                type: 'save',
                payload: {
                    curDepartment: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *getCorpRoles({ payload, callback }, { call, put }) {
            const response = yield call(getCorpRoles, payload);
            yield put({
                type: 'save',
                payload: {
                    corpRoles: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *updateDepartment({ payload, callback }, { call, put }) {
            const response = yield call(updateDepartment, payload);
            yield put({
                type: 'save',
                payload: {
                    updateDpResult: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *fetchMemNum({ payload, callback }, { call, put }) {
            const response = yield call(getMembersNum, payload);
            yield put({
                type: 'save',
                payload: {
                    membersNumResult: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *getAdminRoles({ payload, callback }, { call, put }) {
            const response = yield call(getAdminRoles, payload);
            yield put({
                type: 'save',
                payload: {
                    adminRoles: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *getepDmFileCount({ payload, callback }, { call, put }) {
            const response = yield call(getEnterpriseDepartmentFileCount, payload);
            yield put({
                type: 'save',
                payload: {
                    epDepartmentFileCount: response
                }
            })
            if (callback && typeof callback == 'function') callback(response);
        },
        *clearMemListfetchMemNum({ payload, callback }, { call, put }) {
            yield put({
                type: 'save',
                payload: {
                    dpMembers: {}
                }
            })
        },
        *clearAdminRoles({ _, callback }, { call, put }) {
            yield put({
                type: 'save',
                payload: {
                    adminRoles: {}
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

export default EpModel;
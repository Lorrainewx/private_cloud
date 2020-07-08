import request from '@/utils/request';
import { stringify } from 'qs';

// epDrive 获取企业信息
export async function getEnterPriseDrive() {
    return request('/epdrive/enterprise/enterpriseInfo');
}

// 更新企业信息
export async function updateEnterpriseInfo(params) {
    return request('/epauth/api/corp/info', {
        method: 'POST',
        body: params
    });
}

// epdrive 更新历史版本 versionLimit
export async function updateVersionLimit(params) {
    return request(`/epdrive/enterprise/modifyEnterpriseVersionLimit?${stringify(params)}`, {
        method: 'POST'
    });
}

// 组织结构树
export async function getDepartmentList(params) {
    return request(`/epauth/api/corp/department/list?${stringify(params)}`);
}

// 带成员的组织结构树 department(true 已分组成员) memberName
export async function getDepartmentMemberList(params) {
    return request(`/epauth/api/corp/department/listMembers?${stringify(params)}`);
}

// 新增部门
export async function createDepartment(params) {
    return request(`/epauth/api/corp/department/create?${stringify(params)}`, {
        method: 'POST',
    });
}

// 删除部门
export async function dropDepartment(params) {
    return request(`/epauth/api/corp/department/drop?${stringify(params)}`, {
        method: 'POST',
    });    
}

// 查询部门信息
export async function getDepartmentDetailInfo(params) {
    return request(`/epauth/api/corp/department/info?${stringify(params)}`);    
}

// 用户数量统计 departmentId
export async function getMembersNum(params) {
    return request(`/epauth/api/corp/department/statistic?${stringify(params)}`);
}

// 修改部门信息
export async function updateDepartment(params) {
    return request(`/epauth/api/corp/department/update?${stringify(params)}`, {
        method: 'POST',
    });
}

// 查询部门角色
export async function getCorpRoles(params) {
    return request(`/epauth/api/corp/roles`, {
        body: params,
    });    
}

// 新增企业角色
export async function addRoleForCorp(params) {
    return request(`/epauth/api/corp/role/add?${stringify(params)}`, {
        method: 'POST'
    });    
}

// 企业角色
export async function getAdminRoles() {
    return request(`/epauth/api/admin/corp/role/list`);    
}

// 一级部门文档数量
export async function getEnterpriseDepartmentFileCount() {
    return request(`/epdrive/enterprise/getEnterpriseDepartmentFileCount`);  
}

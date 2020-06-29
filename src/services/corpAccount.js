import request from '@/utils/request';
import { stringify } from 'qs';

// 创建成员
export async function createMember(params) {
    return request(`/epauth/api/corp/create`, {
        method: 'POST',
        body: params,
    });    
}

// 查询成员列表  corpId, departmentId, frozen, name, pageNum, pageSize, roleId
export async function queryMembers(params) {
    return request(`/epauth/api/corp/department/members?${stringify(params)}`);    
}

// 删除成员账号
export async function deleteMember(params) {
    return request(`/epauth/api/corp/dropMember?${stringify(params)}`, {
        method: 'POST',
    });
}

// 查询成员信息
export async function getMemInfo(params) {
    return request(`/epauth/api/corp/member/${params.mid}`);
}

// 编辑用户信息
export async function updateUserInfo(params) {
    return request(`/epauth/api/corp/userinfo`, {
        method: 'POST',
        body: params
    });
}

//添加已有成员
export async function addAlreadyUsers(params) {
    return request(`/epauth/api/corp/department/member/join?${stringify(params)}`, {
        method: 'POST'
    });
}

// 禁用/开启成员
export async function changeAccountState(params) {
    return request(`/epauth/api/admin/corp/changeAccountState?${stringify(params)}`, {
        method: 'POST'
    });
}

// 移除成员 departmentId memberId
export async function moveUsers(params) {
    return request(`/epauth/api/corp/department/member/leave?${stringify(params)}`, {
        method: 'POST'
    });
}

// 重置密码 memberId  password 
export async function resetPwd(params) {
    return request(`/epauth/api/admin/corp/changePassword?${stringify(params)}`, {
        method: 'POST'
    });
}

// 修改部门 memberId destId
export async function moveDepartment(params) {
    return request(`/epauth/api/corp/department/member/move?${stringify(params)}`, {
        method: 'POST'
    });
}

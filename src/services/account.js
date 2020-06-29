import request from '@/utils/request';
import { stringify } from 'qs';

// 管理员列表
export async function getAdminmembersList(params) {
    return request(`/epauth/api/admin/corp/listAdminMembers?${stringify(params)}`);    
}

// 删除管理员
export async function deleteMember(params) {
    return request(`/epauth/api/admin/corp/dropAdminMember?${stringify(params)}`, {
        method: 'POST',
    });    
}

// 添加管理员
export async function addAdmin(params) {
    return request(`/epauth/api/admin/corp/addAdminMember`, {
        method: 'POST',
        body: params,
    });
}

// 管理员菜单
export async function getMenus(params) {
    return request(`/epauth/api/admin/corp/menu/query?${stringify(params)}`);
}

// 最大权限 菜单列表
export async function getMenuConfig() {
    return request(`/epauth/api/admin/corp/menu/list`);
}

// 新增角色 //name 
export async function addNewRole(params) {
    return request(`/epauth/api/admin/corp/role/add?${stringify(params)}`, {
        method: 'POST'
    });
}

// 删除角色 roleId
export async function deleteRole(params) {
    return request(`/epauth/api/admin/corp/role/drop?${stringify(params)}`, {
        method: 'POST'
    });
}

// 角色配置
export async function roleConfig(params) {
    return request(`/epauth/api/admin/corp/role/config?${stringify(params)}`, {
        method: 'POST'
    });
}

// 获取token
export async function getToken() {
    return request(`/epauth/api/account/tokens`);
}

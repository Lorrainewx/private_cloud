import request from '@/utils/request';
import { stringify } from 'qs';


export async function addRole(params) { 
    return request(`/epauth/api/corp/role/add?${stringify(params)}`, {
        method: 'POST'
    });
}

export async function deleteRole(params) {
    return request(`/epauth/api/corp/role/drop?${stringify(params)}`, {
        method: 'POST'
    });
}


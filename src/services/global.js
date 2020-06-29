import request from '@/utils/request';


export async function getEnterpriseInfo() {
    return request('/epauth/api/corp/info');
}


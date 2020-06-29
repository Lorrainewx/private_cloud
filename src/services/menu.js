import request from '@/utils/request';
import { stringify } from 'qs';


// 获取菜单 mock数据
// export async function getMenusData(params) {
//     return request('http://rap2.taobao.org:38080/app/mock/256611/config/menu', {
//         method: 'GET',        
//         body: params
//     });
// }

// 按角色获取菜单
export async function getMenusConfig(params) {
    return request(`/epauth/api/admin/corp/menu/query?${stringify(params)}`);
}
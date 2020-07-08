import request from '@/utils/request';
import { stringify } from 'qs';


export  async function addRole (params){
  console.log('params',params)
  return request(`/epauth/api/corp/role/add?${stringify(params)}`,{
    method: 'POST',
  })
}


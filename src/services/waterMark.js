import request from '@/utils/request';
import { stringify } from 'qs';
export  async function modifyWaterMark (params){
    return request(`/epdrive/enterprise/modifyEnterpriseWaterMark?${stringify(params)}`,{
      method: 'POST',
    })
}
export  async function getEnterpriseWaterMark (params){
  return request('/epdrive/enterprise/getEnterpriseWaterMark')
}
export  async function PreviewWaterMark (params){  //水印预览
  return request(`/epdrive/enterprise/waterMarkPreview?${stringify(params)}`,{
    method:'POST',
  })
}

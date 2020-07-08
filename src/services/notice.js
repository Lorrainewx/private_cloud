import request from '@/utils/request';
import { stringify } from 'qs';
// 添加公告并发布
export async function addWithPublish(params) {
  return request('/epdrive/notice/addWithPublish',{
    method:'POST',
    body:params
  });
}
// 列表查询
export async function getNoticeList(params) {
  return request(`/epdrive/notice/list`,{
    method:'POST',
    body:params
  });
}
// 广告详情
export async function noticeInfo(params) {

  return request(`/epdrive/notice/${params.id}`);
}
// 删除公告
export async function deleteNotice(params) {
  return request(`/epdrive/notice/${params.id}`,{
    method:"DELETE"
  });
}
//添加公告不发布
export async function addWithNoPublish(params) {
  return request('/epdrive/notice/add');
}

// 确认已读
export async function confirmRead(params) {
  return request('/epdrive/notice/confirmRead');
}
//编辑待发布公告
export async function edit(params) {
  return request('/epdrive/notice/edit', {
    method: "POST",
    body: params
  });
}
// 查询公告未确认和确认人数
export async function noticeLookInfo(params) {
  return request(`/epdrive/notice/getNoticeLookInfo?${stringify(params)}`);
}
// 发布公告
export async function pubilsh(params) {
  return request('/epdrive/notice/publish');
}
// 批量删除公告
export async function batchDel(params) {
  return request('/epdrive/notice/batchDel',{
    method:"POST",
    body:params
  });
}

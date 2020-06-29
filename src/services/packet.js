import request from '@/utils/request';
import { stringify } from 'qs';

// 群组 分页查询
// 根据条件对群组进行分页查询
export async function queryPacketList(params) {
    return request(`/epdrive/packet/listPacketByCondition?${stringify(params)}`);
}

// 查询成员  
export async function queryPacketMembers(params) {
    return request(`/epdrive/packet/listPacketMembersInfo?${stringify(params)}`);
}

// 移交群组 packetId   targetUserId
export async function transferPacket(params) {
    return request(`/epdrive/packet/transferPacket?${stringify(params)}`, {
        method: 'POST'
    })
}

// 获取群组空间使用量
export async function getPacketSpaceUsed() {
    return request(`/epdrive/enterprise/getPacketSpaceUsed`);    
}

// 获取群组数量
export async function getPacketTotal() {
    return request(`/epdrive/packet/getPacketCount`);
}

// 分组查询公告 
export async function getPacketBulletins(params) {
    return request(`/epdrive/packet/listPacketPost?${stringify(params)}`);
}

// 删除公告  packetPostId
export async function deletePackets(params) {
    return request(`/epdrive/packet/deletePacketPost?${stringify(params)}`, {
        method: 'DELETE'
    });
}

// 修改群组空间上限  size  packetIds
export async function modifyPacketSpaceLimit(params) {
    return request(`/epdrive/packet/modifyPacketSpaceLimit?${stringify(params)}`, {
        method: 'POST'
    });
}
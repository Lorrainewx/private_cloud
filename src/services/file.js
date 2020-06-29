import request from '@/utils/request';
import { stringify } from 'qs';
import { omit } from 'lodash';

// 下载文件
export async function downloadFiles(params) {
    return request(`/epdrive/file/downloadFile?${stringify(params)}`, {
        method: 'POST',
    });    
}

// 预览文件 fileId mobile uuid version
export async function previewFile(params) {
    return request(`/epdrive/file/preview`, {
        method: 'POST',
        body: params,
    });    
}
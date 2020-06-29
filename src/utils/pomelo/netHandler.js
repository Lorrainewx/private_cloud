import { message, notification } from 'antd';
import { RESULT_STATUS } from "@/const/STATUS";
import { MESSAGE_TYPE } from "@/const/MESSAGE_TYPE";
import { FILE_EVENTS, NOTIFICATION_EVENTS } from "@/const/EVENTS";
import NetService from "./netService";
// import PomeloClient from "./pomeloClient";

const ErrorHander = (res, hasErrorCb) => {
    if (!res) return;
    //默认弹出错误提示框
    if (!!!hasErrorCb) {
        message.error(`${res.message || res.msg}`);
    } else {
        return {
            code: res.resultCode,
            message: res.msg,
        }
    }
}

const NetHandler = {
    handleMessage: (data) => {
        data["time"] = new Date(data["time"] * 1000);
        let msg = data["msgContent"];
        let msgType = data['type'];
        let fileId = data['fileId'];
        let parentId = data['parentId'];
        let fileType = msg['type'];
        let shareId = data["fileId"];
        let userId = JSON.stringify(localStorage.getItem('user')).userId;
        let list;
        let i;
        switch (msgType) {
            case MESSAGE_TYPE.STOP_SHARE:
                break;
            case MESSAGE_TYPE.DELETE:
                break;
            case MESSAGE_TYPE.INVITATION: //mashx
                break;
            case MESSAGE_TYPE.OPEN_LINK:
            case MESSAGE_TYPE.ACCEPT_OR_DENY_INVITATION:
            case MESSAGE_TYPE.REQUEST_LINK_SHARE:
            case MESSAGE_TYPE.REQUEST_INVITE_SHARE:
                break;
            case MESSAGE_TYPE.REMOVE_INVITATION:
                break;
            case MESSAGE_TYPE.LEAVE_SHARE:
                break;
            case MESSAGE_TYPE.SET_USER_ROLE:
                break;
            case MESSAGE_TYPE.MODIFY_LINK_LEVEL:
                break;
            case MESSAGE_TYPE.KICK_FROM_SHARE:
                break;
            case MESSAGE_TYPE.RENAME:
                break;
            case MESSAGE_TYPE.CREATE:
                break;
            case MESSAGE_TYPE.NEW_VERSION:
                break;
            case MESSAGE_TYPE.REQUEST_LINK_SHARE:
                break;
            case MESSAGE_TYPE.REQUEST_INVITE_SHARE:
                break;
            case MESSAGE_TYPE.CLOSE_LINK:
                break;
            case MESSAGE_TYPE.COPY:
                break;
            case MESSAGE_TYPE.MOVE_IN:
                break;
            case MESSAGE_TYPE.MOVE:
                break;
            case MESSAGE_TYPE.MOVE_OUT:
                break;
            case MESSAGE_TYPE.MULTI_UPLOAD:
                break;
        }
    },
    handleSelf: (data) => {
        data["time"] = new Date(data["time"] * 1000);
        let msgContent = data['msgContent'];
        let msgType = msgContent['msgType'];
        let list;
        switch (msgType) {
            case MESSAGE_TYPE.NEW_VERSION:

                break;
            case MESSAGE_TYPE.MULTI_UPLOAD:

                break;
            case MESSAGE_TYPE.DELETE:

                break;
        }
    },
    handleKick: (data) => {
        let msg = "";
        switch (data['type']) {
            case 1:
                msg = "管理员限制了你登录的mac地址，点击确认退出";
                break;
            case 2:
                msg = "你已通过其他设备退出当前登录，点击确认退出";
                break;
        }
        notification.error({
            message: '登出后台',
            description: msg,
        });
        // PomeloClient.disconnect();
        localStorage.clear();   //清除所有的存储信息
    },
    getUserEnterpriseMemberInfo: async (data) => {
        const res = await NetService.getUnprocessedNotifications(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    getAllDepartments: async () => {
        const res = await NetService.getAllDepartments();
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    getDepartmentDetailInfo: async (data) => {
        const res = await NetService.getDepartmentDetailInfo(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    getDepartmentMembers: async (data) => {
        const res = await NetService.getDepartmentMembers(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    getUserEnterpriseMemberInfo: async (data) => {
        const res = await NetService.getUserEnterpriseMemberInfo(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    getCurrentEnterpriseInfo: async () => {
        const res = await NetService.getCurrentEnterpriseInfo();
        console.log('res', res);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    searchEnterpriseMember: async (data) => {
        const res = await NetService.searchEnterpriseMember(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    changeDepartmentInfo: async (data) => {
        const res = await NetService.changeDepartmentInfo(data);
        console.log(res);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    deleteDepartment: async (data) => {
        const res = await NetService.deleteDepartment(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    createDepartment: async (data) => {
        const res = await NetService.createDepartment(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    getAllEnterpriseRoles: async () => {
        const res = await NetService.getAllEnterpriseRoles();
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    getAllDepartmentRoles: async () => {
        const res = await NetService.getAllDepartmentRoles();
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    deleteMembersById: async (data) => {
        const res = await NetService.deleteMembersById(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    getDocumentInfo: async () => {
        const res = await NetService.getDocumentInfo();
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    setDepartmentSpaceInfo: async (data) => {
        const res = await NetService.setDepartmentSpaceInfo(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    setMemberSpaceByDepartment: async (data) => {
        const res = await NetService.setMemberSpaceByDepartment(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    getAllDepartmentRolesAndPermission: async () => {
        const res = await NetService.getAllDepartmentRolesAndPermission();
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    deleteDepartmentRole: async (data) => {
        const res = await NetService.deleteDepartmentRole(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    changeRoleInfo: async (data) => {
        const res = await NetService.changeRoleInfo(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    migrateDepartmentRoleTo: async (data) => {
        const res = await NetService.migrateDepartmentRoleTo(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    searchFileByName: async (data) => {
        const res = await NetService.searchFileByName(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    listDir: async (data) => {
        const res = await NetService.listDir(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    listDirByDepartmentId: async (data) => {
        const res = await NetService.listDirByDepartmentId(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    deleteFilesInTrash: async (data) => {
        const res = await NetService.deleteFilesInTrash(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
    deleteByIds: async (data) => {
        const res = await NetService.deleteByIds(data);
        if (!res) return;
        if (res.resultCode == RESULT_STATUS.SUCCESS) {
            return res;
        } else {
            ErrorHander(res);
        }
    },
  addDepartmentRole: async (data) => {
    const res = await NetService.addDepartmentRole(data);
    if (!res) return;
    if (res.resultCode == RESULT_STATUS.SUCCESS) {
      return res;
    } else {
      ErrorHander(res);
    }
  },
  searchFileByDepartmentId: async (data) => {
    const res = await NetService.searchFileByDepartmentId(data);
    if (!res) return;
    if (res.resultCode == RESULT_STATUS.SUCCESS) {
      return res;
    } else {
      ErrorHander(res);
    }
  },
  closeLinkShare: async (data) => {
    const res = await NetService.closeLinkShare(data);
    if (!res) return;
    if (res.resultCode == RESULT_STATUS.SUCCESS) {
      return res;
    } else {
      ErrorHander(res);
    }
  },
  cancelShare:  async (data) => {
    const res = await NetService.cancelShare(data);
    if (!res) return;
    if (res.resultCode == RESULT_STATUS.SUCCESS) {
      return res;
    } else {
      ErrorHander(res);
    }
  },
  getAccessList: async (data) => {
    const res = await NetService.getAccessList(data);
    if (!res) return;
    if (res.resultCode == RESULT_STATUS.SUCCESS) {
      return res;
    } else {
      ErrorHander(res);
    }
  },
}

export default NetHandler;

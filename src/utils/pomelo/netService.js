import PomeloClient from "./pomeloClient";
import PomeloRoute from "./Route";

const NetService = {
    getAllDepartments: async() => PomeloClient.request(PomeloRoute.getAllDepartments, {}),
    getDepartmentDetailInfo: async(data) => PomeloClient.request(PomeloRoute.getDepartmentDetailInfo, data),
    getDepartmentMembers: async(data) => PomeloClient.request(PomeloRoute.getDepartmentMembers, data),
    searchEnterpriseMember: async(data) => PomeloClient.request(PomeloRoute.searchEnterpriseMember, data),
    getUserEnterpriseMemberInfo: async(data) => PomeloClient.request(PomeloRoute.getUserEnterpriseMemberInfo, data),
    getCurrentEnterpriseInfo: async() => PomeloClient.request(PomeloRoute.getCurrentEnterpriseInfo, {}),
    changeDepartmentInfo: async(data) => PomeloClient.request(PomeloRoute.updateDepartmentInfo, data),
    deleteDepartment: async(data) => PomeloClient.request(PomeloRoute.deleteDepartment, data),
    createDepartment: async(data) => PomeloClient.request(PomeloRoute.createDepartment, data),
    getAllEnterpriseRoles: async(data) => PomeloClient.request(PomeloRoute.getAllEnterpriseRoles, data),
    getAllDepartmentRoles: async(data) => PomeloClient.request(PomeloRoute.getAllDepartmentRoles, data),
    deleteMembersById: async(data) => PomeloClient.request(PomeloRoute.deleteMembersById, data),
    getDocumentInfo: async() => PomeloClient.request(PomeloRoute.getDocumentInfo),
    setDepartmentSpaceInfo: async(data) => PomeloClient.request(PomeloRoute.setDepartmentSpaceInfo, data),
    setMemberSpaceByDepartment: async(data) => PomeloClient.request(PomeloRoute.setMemberSpaceByDepartment, data),
    getAllDepartmentRolesAndPermission: async() => PomeloClient.request(PomeloRoute.getAllDepartmentRolesAndPermission),
    deleteDepartmentRole: async(data) => PomeloClient.request(PomeloRoute.deleteDepartmentRole, data),
    changeRoleInfo: async(data) => PomeloClient.request(PomeloRoute.changeRoleInfo, data),
    migrateDepartmentRoleTo: async(data) => PomeloClient.request(PomeloRoute.migrateDepartmentRoleTo, data),
    searchFileByName: async(data) => PomeloClient.request(PomeloRoute.searchFileByName, data),
    listDir: async(data) => PomeloClient.request(PomeloRoute.listDir, data),
    listDirByDepartmentId: async(data) => PomeloClient.request(PomeloRoute.listDirByDepartmentId, data),
    deleteFilesInTrash: async(data) => PomeloClient.request(PomeloRoute.deleteFilesInTrash, data),
    deleteByIds: async(data) => PomeloClient.request(PomeloRoute.deleteByIds, data),
    addDepartmentRole: async(data) => PomeloClient.request(PomeloRoute.addDepartmentRole, data),
    searchFileByDepartmentId: async(data) => PomeloClient.request(PomeloRoute.searchFileByDepartmentId, data),
    closeLinkShare: async(data) => PomeloClient.request(PomeloRoute.closeLinkShare, data),    
    cancelShare: async(data) => PomeloClient.request(PomeloRoute.cancelShare, data),
    getAccessList: async(data) => PomeloClient.request(PomeloRoute.getAccessList, data),
}

export default NetService;

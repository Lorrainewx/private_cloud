const PomeloRoute= {
    //connect
    Connect_Route: 'connector.entryHandler.connect',//ws
    SConnect_Route: 'sconnector.entryHandler.connect', //wss

    // enterprise
    getAllDepartments: "netDrive.enterpriseHandler.getAllDepartments",
    getDepartmentDetailInfo: "netDrive.enterpriseHandler.getDepartmentDetailInfo",
    getDepartmentMembers: 'netDrive.enterpriseHandler.getDepartmentMembers',
    getUserEnterpriseMemberInfo: 'netDrive.enterpriseHandler.getUserEnterpriseMemberInfo',
    getCurrentEnterpriseInfo: 'netDrive.enterpriseHandler.getCurrentEnterpriseInfo',
    updateDepartmentInfo: 'netDrive.enterpriseHandler.updateDepartmentInfo',
    deleteDepartment: 'netDrive.enterpriseHandler.deleteDepartment',
    createDepartment: 'netDrive.enterpriseHandler.createDepartment',
    searchEnterpriseMember: 'netDrive.enterpriseHandler.searchEnterpriseMember',
    getAllEnterpriseRoles: 'netDrive.enterpriseHandler.getAllEnterpriseRoles',
    getAllDepartmentRoles: 'netDrive.enterpriseHandler.getAllDepartmentRoles',
    deleteMembersById: 'netDrive.enterpriseHandler.deleteMembersById',
    getDocumentInfo: 'netDrive.enterpriseHandler.getDocumentInfo',
    setDepartmentSpaceInfo: 'netDrive.enterpriseHandler.setDepartmentSpaceInfo',
    setMemberSpaceByDepartment: 'netDrive.enterpriseHandler.setMemberSpaceByDepartment',
    getAllDepartmentRolesAndPermission: 'netDrive.enterpriseHandler.getAllDepartmentRolesAndPermission',
    deleteDepartmentRole: 'netDrive.enterpriseHandler.deleteDepartmentRole',
    changeRoleInfo: "netDrive.enterpriseHandler.changeRoleInfo", 
    migrateDepartmentRoleTo: 'netDrive.enterpriseHandler.migrateDepartmentRoleTo',
    searchFileByName: 'netDrive.fileHandler.searchFileByName',
    searchFileByDepartmentId: 'netDrive.fileHandler.searchFileByDepartmentId',
    listDir: 'netDrive.fileHandler.listDir',
    listDirByDepartmentId: 'netDrive.fileHandler.listDirByDepartmentId',
    addDepartmentRole: 'netDrive.enterpriseHandler.addDepartmentRole',  // 增加部门角色
    deleteFilesInTrash: 'netDrive.fileHandler.deleteFilesInTrash',  // 永久删除
    deleteByIds: 'netDrive.fileHandler.deleteByIds',  // 删除
    closeLinkShare: 'netDrive.fileHandler.closeLinkShare', // 关闭链接共享
    cancelShare: 'netDrive.fileHandler.cancelShare',  // 关闭协作
    getAccessList: 'netDrive.fileHandler.getAccessList',  // 获取企业文件夹forderID
    
  }
  
  export default PomeloRoute;
  
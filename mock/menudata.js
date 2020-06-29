const getMenu = (req, res) => {
    res.json([
        {
            id: "1",
            component: '@/layouts/BasicLayout', 
            permissionName: "优云文档管理系统",
            parentId: "0",
            icon: null,
            path: "/",
            children: [
                {
                    id: "2",
                    permissionName: "数据看板",
                    name: "dashboard",
                    parentId: "1",
                    icon: "DashboardOutlined",   
                    component: '@/pages/Dashboard',
                    path: "/dashboard",
                    // authority: ["CorpAdmin"], 
                    children: null,
                },
                {
                    id: "3",
                    permissionName: "文档管理",
                    name: "files",
                    parentId: "1",
                    icon: "FileTextOutlined",
                    path: "/files",
                    authority: ["CorpAdmin"], 
                    children: [
                        {
                            id: "4",
                            permissionName: "部门文档管理",
                            name: 'department',
                            parentId: "3",
                            icon: null,
                            component: '@/pages/Files/Department',
                            path: "/files/department",
                            children: null,
                        },
                        {
                            id: "5",
                            permissionName: "群组文档管理",
                            name: 'team',
                            parentId: "3",
                            icon: null,
                            component: '@/pages/Files/Team',
                            path: "/files/team",
                            children: null,
                        },
                        {
                            id: "6",
                            permissionName: "群企业共享文档管理",
                            name: 'share',
                            parentId: "3",
                            icon: null,
                            component: '@/pages/Files/Share',
                            path: "/files/share",
                            children: null,
                        },
                    ]
                },
                {
                    id: "7",
                    permissionName: "群组管理",
                    name: 'team',
                    parentId: "1",
                    icon: "TeamOutlined",
                    path: "/team",
                    component: null,
                    authority: ["CorpAdmin"], 
                    children: [
                        {
                            id: "8",
                            permissionName: "群组管理",
                            name: 'manage',
                            parentId: "7",
                            icon: null,
                            component: "@/pages/Team/Manage",
                            path: "/team/manage",
                            children: null,
                        },
                        {
                            id: "9",
                            permissionName: "群组公告",
                            name: 'bulletins',
                            parentId: "7",
                            icon: null,
                            component: "@/pages/Team/Bulletins",
                            path: "/team/bulletins",
                            children: null,
                        },
                    ],
                },
                {
                    id: "13",
                    permissionName: "部门管理",
                    name: 'department',
                    parentId: "1",
                    icon: "ApartmentOutlined",
                    path: "/department",
                    authority: ["CorpAdmin"], 
                    children: [
                        {                            
                            id: "14",
                            permissionName: "组织架构",
                            name: 'orgStructure',
                            parentId: "13",
                            icon: null,
                            component: "@/pages/Department/OrgStructure",
                            path: "/department/orgStructure",
                            children: null,
                        }
                    ]
                },
                {
                    id: "15",
                    permissionName: "通用设置",
                    name: 'generalsetting',
                    parentId: "1",
                    icon: "SettingOutlined",
                    path: "/generalsetting",
                    authority: ["CorpAdmin"], 
                    children: [
                        {                            
                            id: "16",
                            permissionName: "基础设置",
                            name: 'infrastructure',
                            parentId: "15",
                            icon: null,
                            component: "@/pages/Generalsetting/Infrastructure",
                            path: "/generalsetting/infrastructure",
                            children: null,
                        },
                        {                            
                            id: "17",
                            permissionName: "空间设置",
                            name: 'space',
                            parentId: "15",
                            icon: null,
                            component: "@/pages/Generalsetting/Space",
                            path: "/generalsetting/space",
                            children: null,
                        },
                        {
                            id: "47",
                            permissionName: "公告管理",
                            name: 'bulletins',
                            parentId: "15",
                            icon: null,
                            component: "@/pages/Generalsetting/Bulletins",
                            path: "/generalsetting/bulletins",
                            children: null,
                        }
                    ]
                },
                {
                    id: "10",
                    permissionName: "安全管理",
                    name: 'security',
                    parentId: "1",
                    icon: "SafetyCertificateOutlined",
                    path: "/security",
                    authority: ["CorpAdmin"], 
                    children: [
                        {
                            id: "11",
                            permissionName: "水印管理",
                            name: 'watermark',
                            parentId: "10",
                            icon: null,
                            component: "@/pages/Security/Watermark",
                            path: "/security/watermark",
                            children: null,
                        },
                        {                            
                            id: "12",
                            permissionName: "权限配置",
                            name: 'jurisdiction',
                            parentId: "10",
                            icon: null,
                            component: "@/pages/Security/Jurisdiction",
                            path: "/security/jurisdiction",
                            children: null,
                        }
                    ]
                },
                {
                    id: "18",
                    permissionName: "管理员管理",
                    name: 'admin',
                    parentId: "1",
                    icon: "UserOutlined",
                    path: "/admin",
                    authority: ["CorpAdmin"], 
                    component: null,
                    children: [                        
                        {                            
                            id: "19",
                            permissionName: "角色管理",
                            name: 'role',
                            parentId: "18",
                            icon: null,
                            component: "@/pages/Admin/Role",
                            path: "/admin/role",
                            children: null,
                        },
                        {                            
                            id: "20",
                            permissionName: "管理员管理",
                            name: 'manage',
                            parentId: "18",
                            icon: null,
                            component: "@/pages/admin/Manage",
                            path: "/admin/manage",
                            children: null,
                        }
                    ]
                }
            ]
        }
        
    ])
  };
  
  export default {
    'GET /config/menu': getMenu,
  };
  
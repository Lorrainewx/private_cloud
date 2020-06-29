const Menus = [
    {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
            {
                path: '/user',
                redirect: '/user/login',
            },
            {
                name: 'login',
                path: '/user/login',
                component: './user/login',
            },
        ],
    },
    {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
            {
                path: '/',
                component: '../layouts/BasicLayout',
                routes: [
                    {
                        path: '/dashboard',
                        name: 'dashboard',
                        icon: 'dashboard',
                        component: './Dashboard',
                    },
                    {
                        path: '/files',
                        name: 'files',
                        icon: 'FileDoneOutlined',
                        routes: [
                            {
                                path: '/files/department',
                                name: 'department',
                                icon: 'smile',
                                component: './Files/Department',
                            },
                            {
                                path: '/files/team',
                                name: 'team',
                                icon: 'smile',
                                component: './Files/Team',
                            },
                            {
                                path: '/files/share',
                                name: 'share',
                                icon: 'smile',
                                component: './Files/Share',
                            },
                        ],
                    },
                    {
                        name: 'team',
                        icon: 'team',
                        path: '/team',
                        routes: [
                            {
                                path: '/team/manage',
                                name: 'manage',
                                icon: 'smile',
                                component: './Team/Manage',
                            },
                            {
                                path: '/team/bulletins',
                                name: 'bulletins',
                                icon: 'smile',
                                component: './Team/Bulletins',
                            }
                        ]
                    },
                    {
                        name: 'security',
                        path: '/security',
                        icon: 'SettingOutlined',
                        routes: [
                            {
                                path: '/security/watermark',
                                name: 'watermark',
                                icon: 'smile',
                                component: './Security/Watermark',
                            },
                            {
                                path: '/security/jurisdiction',
                                name: 'jurisdiction',
                                icon: 'smile',
                                component: './Security/Jurisdiction',
                            },
                        ]
                    },
                    {
                        name: 'department',
                        path: '/department',
                        icon: 'SettingOutlined',
                        routes: [
                            {
                                path: '/department/orgStructure',
                                name: 'orgStructure',
                                icon: 'smile',
                                component: './Department/OrgStructure',
                            },
                        ]
                    },
                    {
                        path: '/generalsetting',
                        name: 'generalsetting',
                        icon: 'smile',
                        routes: [
                            {
                                path: '/generalsetting/infrastructure',
                                name: 'infrastructure',
                                icon: 'smile',
                                component: './GeneralSetting/Infrastructure',
                            },
                            // {
                            //     path: '/generalsetting/space',
                            //     name: 'space',
                            //     icon: 'smile',
                            //     component: './GeneralSetting/Space',
                            // },
                            {
                                path: "/generalsetting/bulletins",
                                name: 'bulletins',
                                component: "./GeneralSetting/Bulletins",
                            }
                        ]
                    },
                    {
                        path: '/admin',
                        name: 'admin',
                        icon: 'smile',
                        routes: [
                            {
                                path: '/admin/role',
                                name: 'role',
                                icon: 'smile',
                                component: './Admin/Role',
                            },
                            {
                                path: '/admin/manage',
                                name: 'manage',
                                icon: 'smile',
                                component: './Admin/Manage',
                            },
                        ]
                    },
                    {
                        component: './404',
                    },
                ],
            },
            {
                component: './404',
            },
        ],
    },
    {
        component: './404',
    },
]

export default Menus;
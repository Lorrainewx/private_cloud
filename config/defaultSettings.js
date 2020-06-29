const release = false;
export default {
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'sidemenu',
  contentWidth: 'Fluid',
  fixedHeader: false,
  autoHideHeader: false,
  fixSiderbar: false,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: '优云文档管理系统',
  pwa: false,
  version: 14,
  auth: release ? 'https://auth.yozocloud.cn' : 'https://auth.yozodocs.com',
  yocloud: release ? 'https://www.yozocloud.cn' : 'https://www.yozodocs.com',
  devAuth: 'http://192.168.1.3',
  sourceUrl: 'https://yozonetdriver.obs.cn-east-2.myhuaweicloud.com',
  shema: "https",
  host: "pomelo.yozodocs.com",
  connectRoute: "connector.entryHandler.connect",
  port: 3080,
  protocal: "ws",
  devHost: '192.168.1.3',
  devPort: 3060,
};

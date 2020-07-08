
// const window = window || false;
const release = false;
const localEnv = true;  // 是否是本地开发环境
const pomeloEnv = true;   //pomelo配置信息选择，为true时（手动配置对应值），为false时（从当前页面url获取对应值）
const host = location?.host; //当前域名
const protocol = location?.protocol.replace(':',''); //当前浏览器协议
export default {
  devAuth: localEnv ? 'http://192.168.1.3' : protocol == 'http' ? `http://${host}` : `https://${host}`,
  protocal: protocol == 'http' ? "ws":'wss',
  host: pomeloEnv ? "192.168.1.3" : host,
  port: protocol == 'http' ? '3060' : '3080',
  connectRoute: protocol == 'http' ? "connector.entryHandler.connect" :'sconnector.entryHandler.connect',  
};

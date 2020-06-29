import './pomelo';
import { message } from 'antd';
import { HTTP_STATUS, RESULT_STATUS } from "@/const/STATUS";
import NetHandler from "./netHandler";
import PomeloRoute from "./Route";
import defaultSettings from '../../../config/defaultSettings';
import { getCookie, Base64_decode } from '@/utils/utils.js';

const pomelo = window.pomelo;

let connectCallbacks = [],
    isConnected = false,
    requestCount = 0,
    session = null,
    requererror = 0,
    needReConnect = true,
    sid = null;

let defaultParams = {
    "appVer": 3.0,
    "app": "ep-web"
};

let { shema, host, connectRoute, port, protocal, devHost, devPort } = defaultSettings;

//TODO 连接失败处理
const _connect_p = () => {
    return new Promise(resolve => pomelo.init({
        host: devHost,
        port: devPort,
        protocal,
        reconnect: true,
    }, function (res) {
        resolve(res);
    })
    );
};


const connect_p = async (callback) => {
    if (isConnected) {
        callback && setTimeout(callback, 0);
        return true;
    }
    if (callback) connectCallbacks.push(callback);
    const res = await _connect_p();
    if (res) {
        //注册pomelo
        const result = await _registerConnection_p();
        if (result) {
            connectCallbacks.forEach(function (v) {
                v();
            });
            connectCallbacks = [];
            _initEvents();
            return true;
        }
    }
    return false;
}

const _registerConnection_p = async () => {
    const curUser = JSON.parse(localStorage.getItem('user'));
    if (!curUser || !curUser.userId) return;

    const tokenConfig = localStorage.getItem('token') && JSON.parse(localStorage.getItem('token'));
    const epInfoConfig = localStorage.getItem('epInfo') && JSON.parse(localStorage.getItem('epInfo'));
    
    let SESSION_ID = getCookie('SESSION');
    let sid = "";
    if (SESSION_ID) { sid = Base64_decode(SESSION_ID) };
    session = {
        // sid: sid,
        ...tokenConfig,
        userId: curUser.userId || "0",
        hostname: epInfoConfig && epInfoConfig.domain,
        ...defaultParams,
    }

    return await new Promise(resolve => {
        pomelo.request(connectRoute, session, data => {
            console.log(session, 'session');
            if (data['resultCode'] == RESULT_STATUS.ERROR_PERMISSION_DENIED) {
                needReConnect = false;
                disconnect();
                return;
            }
            if (data['resultCode'] == RESULT_STATUS.ERROR_USER_NOT_FOUND) {
                needReConnect = false;
                disconnect();
                return;
            }
            isConnected = true;
            resolve(true);
        }, err => {
            resolve(false);
        })
    });
}

const _initEvents = () => {
    pomelo.removeAllListeners();    
    pomelo.on('disconnect', function(res) {
        console.log("=======disconnect=======", res);
        if(requererror<2&&res.code!=1000){
            reconnectAndCall();
            requererror++;
        }else{
            handleConnectError();

        }
    });
    pomelo.on('heartbeat timeout', function (res) {
        console.log("=======heartbeat timeout=======", res);
    });

    pomelo.on('reconnect', function (res) {
        console.log("========pomelo:reconnect========", res);
        if (!needReConnect) return;
        reconnectAndCall();
    });

    pomelo.on('onPasswordChanged', function (res) {
        console.log('========pomelo:onPasswordChanged=========', res)
    });

    pomelo.on('onMacBindRemove', function (res) {
        console.log('======pomelo:onMacBindRemove=======', res)
    });

    pomelo.on('onKick', function (res) {
        console.log("=======pomelo:onKick========", res);
        // disconnect();
        needReConnect = false;
        NetHandler.handleKick(res);
    });

    pomelo.on('deleteMemberFromEnterprise', function (res) {
        console.log("pomelo:deleteMemberFromEnterprise", res);
    });

    pomelo.on('error', function (res) {
        console.log("Pomelo:error", res);
    });

    pomelo.on('onmessage', function (res) {
        console.log("Pomelo:onMessage", res);
        NetHandler.handleMessage(res);
    });
    pomelo.on('onJoin', function (res) {
        console.log("Pomelo:onJoin", res);
    });
    pomelo.on('onLeave', function (res) {
        console.log("Pomelo:onLeave", res);
    });
    pomelo.on('onAction', function (res) {
        console.log("Pomelo:onAction", res);
    });
    pomelo.on('onSelf', function (res) {
        NetHandler.handleSelf(res);
        console.log("Pomelo:onSelf", res);
    });
    pomelo.on('io-error', function (res) {
        console.log("Pomelo:io-error", res);
        // message.error('网络异常，请稍后再试');
        return;
    });

}

const disconnect = () => {
    pomelo.disconnect();
    isConnected = false;
    connectCallbacks = [];
}

const reconnectAndCall = async (callback) => {
    disconnect();
    await connect_p(callback);
}


const handleConnectError = () => {
    console.error('连接失败');
    disconnect();
}

const request = async (PomeloRoute, msg, needcb) => {
    if (!pomelo.socket || pomelo.socket.readyState != 1) {
        await reconnectAndCall();
    }
    if (!isConnected) return;
    requestCount++;
    const start = Date.now();
    if (!msg) {
        msg = {};
    }
    const result = await new Promise((resolve) => {
        pomelo.request(PomeloRoute, { ...msg, ...defaultParams }, (res, two, three) => {
            if (typeof res["resultCode"] == 'undefined' && typeof res["code"] == 'undefined') { //res instanceof Error
                res.resultCode = -1;
                res.message = '网络连接失败';
                resolve(res, two, three);
            }
            if (res.code == HTTP_STATUS.SERVER_ERROR) {
                requererror++;
                reconnectAndCall();
                return;
            }

            const end = Date.now();
            delete msg.app;
            delete msg.appVer;
            console.log("======================REQUEST " + requestCount + ":", (end - start) + 'ms', res["resultCode"], res, PomeloRoute, msg, '=================');
            resolve(res, two, three);
        });
    });
    if (!result) handleConnectError();
    requererror = 0;
    return result;
};

const PomeloClient = {
}
PomeloClient.connect = connect_p;
PomeloClient.disconnect = disconnect;
PomeloClient.request = request;
PomeloClient.handleConnectError = handleConnectError;
PomeloClient.reconnectAndCall = reconnectAndCall;
export default PomeloClient;

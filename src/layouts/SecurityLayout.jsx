import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { Redirect, connect } from 'umi';
import { stringify } from 'querystring';
import { setAuthority } from '@/utils/authority';
import { RESULT_STATUS } from '@/const/STATUS';
import defaultSettings from '../../config/defaultSettings';
const { devAuth } = defaultSettings;

class SecurityLayout extends React.Component {
  state = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const { dispatch } = this.props;

    if (dispatch) {
      dispatch({
        type: 'global/fetchEpInfo'
      })
      dispatch({
        type: 'user/isLogin'
      })
      dispatch({
        type: 'user/fetchCurrent',
        callback: (res) => {
          if (res && res.code === RESULT_STATUS.SUCCESS) {
            dispatch({
              type: 'enterprise/getAdminRoles',
              callback: r => {
                if (r && r.code == RESULT_STATUS.SUCCESS) {
                  let currentUser = res.data;
                  let adminRole = currentUser && currentUser.adminRole || undefined;
                  let role = r.data.filter(i => i.name == adminRole)[0];
                  let roleId = role && role.id;
                  dispatch({
                    type: 'menus/fetchMenu',
                    payload: { roleId },
                  });
                }
              }
            })
          }
        },
      });
    }
  }

  render() {
    const { isReady } = this.state;
    const { children, loading, currentUser, global, isUserSiginInfo, menus: { menusData }, account: { token } } = this.props; // You can replace it to your authentication rule (such as check token exists)
    // 你可以把它替换成你自己的登录认证规则（比如判断 token 是否存在）
    // const isLogin = currentUser && currentUser.data && currentUser.data.userId;
    const isLogin = isUserSiginInfo && isUserSiginInfo.code == 0 && currentUser && currentUser.code == 0 && currentUser.data && currentUser.data.userId;
    // 设置enterprise配置
    global.epInfo.code == RESULT_STATUS.SUCCESS && localStorage.setItem('epInfo', JSON.stringify(global.epInfo.data));

    if ((!isLogin && loading) || !isReady) {
      return <PageLoading />;
    }

    if (!isLogin && window.location.pathname !== '/user/login') {
      return <Redirect to={`/user/login`} />;
      // window.location.href=`${devAuth}/login/login.html`;
    }

    currentUser && currentUser.data && localStorage.setItem('user', JSON.stringify(currentUser.data));
    token && token.data && localStorage.setItem('token', JSON.stringify(token.data));
    currentUser && currentUser.data && setAuthority(currentUser.data.role);

    let firstMenu = menusData.length > 0 && menusData[0] || {};
    if (JSON.stringify(firstMenu) == "{}") {      
      return children;
    }

    let firstPath = firstMenu.children.length > 0 ? firstMenu.children[0].relativePath : firstMenu.relativePath;
    
    if(window.location.pathname == "/epadmin/") {
      this.props.history.push(firstPath);
    }

    return children;
  }
}

export default connect(({ user, loading, global, enterprise, menus, account }) => ({
  currentUser: user.currentUser,
  isUserSiginInfo: user.isUserSiginInfo,
  loading: loading.models.user,
  global,
  enterprise,
  menus,
  account,
}))(SecurityLayout);

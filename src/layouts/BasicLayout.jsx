/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import * as allIcons from '@ant-design/icons/es';
import { Link, useIntl, connect } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import { Result, Button } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { getAuthorityFromRouter } from '@/utils/utils';
import defaultSettings from '../../config/defaultSettings';
import styles from './UserLayout.less';
// import logo from '../assets/youyun.svg';
import { RESULT_STATUS } from '@/const/STATUS';

const { devAuth } = defaultSettings;

const toHump = (name) => name.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());

const formatter = (data) => {
  data.forEach(item => {
    if (item.icon && typeof item.icon == 'string') {
      const { icon } = item;
      const v4IconName = toHump(icon.replace(icon, icon.toUpperCase()));
      const NewIcon = allIcons[icon] || allIcons[''.concat(v4IconName, 'Outlined')];
      if (NewIcon) {
        try {
          // eslint-disable-next-line no-param-reassign
          item.icon = React.createElement(NewIcon);
        } catch (error) {
          console.log(error);
        }
      }
    }

    if (item.routes || item.children) {
      const children = formatter(item.routes || item.children); // Reduce memory usage

      item.children = children;
    }
  });
  return data;
};

const patchRoutes = (routes) => formatter(routes);  // 动态菜单配置 转换

const noMatch = (
  // <Result
  //   status={403}
  //   title="403"
  //   subTitle="对不起，该页面未授权给您"
  //   extra={
  //     <Button type="primary">
  //       <Link to="/user/login">前往登录</Link>
  //     </Button>
  //   }
  // />
  <></>
);

/**
 * use Authorized check all menu item
 */
const menuDataRender = menuList =>
  menuList.map(item => {
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    return Authorized.check(item.authority, localItem, null);
  });

const defaultFooterDom = (
  <></>
);

const formatterMenuData = menuList => {
  const newMenuList = menuList && menuList.map(item => {
    return {
      ...item,
      authority: 'CorpAdmin',
      children: item.children && item.children.length > 0 ? formatterMenuData(item.children) : [],
    }
  })
  return newMenuList;
}

const BasicLayout = props => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;
  /**
   * constructor
   */

  // useEffect(() => {
  //   if (dispatch) {
  //   }
  // }, []);
  /**
   * init variables
   */

  const formatter = (menus) => {
    let newData = menus.map(item => {
      let { name, mkey, relativePath, id, children, icon } = item;
      let mkeyArr = mkey.split('_');
      let mkeyLength = mkey.indexOf('_') > -1 ? mkeyArr.length : 0;
      let lastIndex = mkeyLength - 1;
      return {
        name,
        permissionName: name,
        path: relativePath,
        icon,
        children: children ? formatter(children) : [],
      }
    })
    return newData;
  }

  const handleMenuCollapse = payload => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority
  let menusData = props.menus && formatter(props.menus.menusData) || [];
  menusData = formatterMenuData(menusData);

  const authorized = getAuthorityFromRouter(menusData, location.pathname || '/') || {
    authority: 'undefined',
  };

  const { formatMessage } = useIntl();

  return (
    <ProLayout
      logo={`${devAuth}${props.epInfo && props.epInfo.logo}` }
      formatMessage={formatMessage}
      menuHeaderRender={(logoDom, titleDom) => (
        <Link to="#">
          {logoDom}
          <span className={styles.Btitle}>{props.epInfo && props.epInfo.data && props.epInfo.data.abbrev}文档管理系统</span>
        </Link>
      )}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
          return defaultDom;
        }

        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({
            id: 'menu.home',
          }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
            <span>{route.breadcrumbName}</span>
          );
      }}
      footerRender={() => defaultFooterDom}
      menuDataRender={() => patchRoutes(menusData)}
      rightContentRender={() => <RightContent />}
      {...props}
      {...settings}
    >
      <Authorized authority={authorized.authority} noMatch={noMatch}>
        {children}
      </Authorized>
    </ProLayout>
  );
};

export default connect(({ global, settings, menus, user }) => ({
  collapsed: global.collapsed,
  epInfo: global.epInfo,
  settings,
  menus,
  currentUser: user.currentUser,
}))(BasicLayout);

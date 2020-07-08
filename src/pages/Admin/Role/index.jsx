import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Row, Col, Tabs, Button, Tree, Modal, Input, Popconfirm, Spin, message } from 'antd';
import { UserOutlined, PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { connect } from 'dva';

import styles from './index.less';
import { formatter } from '@/utils/cloud';
import { isBlankReg } from '@/utils/reg';
import { Trim } from '@/utils/utils';
import { RESULT_STATUS } from '@/const/STATUS';

const { TabPane } = Tabs;

@connect(({ enterprise, account, loading }) => ({
  enterprise,
  adminRoles: enterprise.adminRoles,
  account,
  loading: loading.effects['account/getMenus']
}))
class Role extends React.Component {
  state = {
    editStatus: false,
    addRoleVisible: false,
    name: "",
    checkedKeys: [],
    roles: [],
    roleId: undefined,
    role: {
      roleName: "",
      roleDataType: null,
      remarks: "",
      delFlag: 1,
      currentTab: 0,
      init: true, // 初始化
    }
  }

  componentDidMount() {
    this.queryRoles(res => {  // 查询当前Tab的基础配置信息
      let roleId = res.data[0].id;
      this.quertCurrentTabInfo(roleId);
    });  // 所有企业角色
    this.queryAllMenus(); //所有菜单
  }

  queryRoles = (cb) => {  // 查询角色
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/getAdminRoles',
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          this.setState({ roles: res.data });
          cb && typeof cb == 'function' && cb(res);
        }
      }
    })
  }

  quertCurrentTabInfo = roleId => {
    this.setState({
      currentTab: roleId,
    });
    this.queryMenus({ roleId }, r => {
      this.findCheckedKeys(r.data);
    });
  }

  queryMenus = (params, cb) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'account/getMenus',
      payload: params,
      callback: res => {
        cb && typeof cb == 'function' && cb(res);
      }
    })
  }

  queryAllMenus = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'account/menuConfig'
    })
  }

  addNewRole = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'account/addNewRole',
      payload: params,
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          let { id } = res.data;
          this.queryRoles(r => {
            this.quertCurrentTabInfo(id);
            this.setState({ editStatus: true });
          });
        }
      }
    })
  }

  deleteRole = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'account/deleteRole',
      payload: params,
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('删除成功');
          this.queryRoles(res => {  // 查询当前Tab的基础配置信息
            let roleId = res.data[0].id;
            this.quertCurrentTabInfo(roleId);
          });
        }
      }
    })
  }

  deleteRoleOK = (role) => {
    let { id: roleId } = role;
    this.deleteRole({ roleId });
  }

  openEdit = () => {
    this.setState({ editStatus: true });
  }

  saveEdit = () => {
    this.setState({ editStatus: false });
    let { checkedKeys, currentTab } = this.state;
    
    this.modifyRolePermission({
      adminRoleId: currentTab,
      menuId : String(checkedKeys),
    })
  }

  addRole = () => {
    this.setState({ addRoleVisible: true });
  }

  addRoleOK = () => {
    let { name, roles } = this.state;
    if (isBlankReg(name)) {
      message.error('角色名不为空');
      return;
    }
    for (let item of roles) {
      name = Trim(name);
      let alreadyName = Trim(item.name);
      if(name == alreadyName) {
        message.error('角色名已存在');
        return;
      }
    }

    this.addNewRole({ name });

    this.closeModal('addRoleVisible');
  }

  closeModal = (type) => {
    this.setState({ [type]: false });
  }

  setPername = e => {
    this.setState({ name: e.target.value });
  }

  select = (selectedKeys, info) => {
    console.log(selectedKeys, info);
  }

  check = (checkedKeys, info) => {
    let { currentTab } = this.state;
    this.setState({ checkedKeys });
  }

  modifyRolePermission = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'account/roleConfig',
      payload: params,
      callback: res => {
        if(res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('修改成功');
        }
      }
    })
  }

  changeTab = value => {
    this.queryMenus({ roleId: value }, res => {
      this.findCheckedKeys(res.data);
    });
    this.setState({
      currentTab: value,
      editStatus: false,
      checkedKeys: [],
    });
  }

  toggleActions = role => {
    let roles;
    let {
      adminRoles,
    } = this.props;
    adminRoles = adminRoles && adminRoles.data || [];
    roles = adminRoles.map(item => { return { ...item, actionVisible: role.id == item.id && !role.actionVisible } });
    this.setState({ roles });
  }

  findCheckedKeys = (list) => {
    let { checkedKeys } = this.state;
    for (let i of list) {
      checkedKeys.push(i.id);
      i.children && this.findCheckedKeys(i.children);
    }

    this.setState({ checkedKeys });
  }

  render() {
    const { editStatus, addRoleVisible, roles, currentTab, checkedKeys } = this.state;
    let {
      account: { menuConfig, currentMenus },
      loading,
    } = this.props;

    menuConfig = menuConfig && menuConfig.data || [];
    currentMenus = currentMenus && currentMenus.data || [];
    const menusData = this.props.menus.menusData;
    const permissionsAllArr = formatter(menuConfig, !editStatus);

    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>角色管理</Typography.Title>
        <Tabs
          activeKey={String(currentTab)}
          animated={false}
          tabPosition="left"
          onChange={this.changeTab}
          className={styles.tabs}
        >
          {
            roles.map(item => {
              return (
                <TabPane
                  tab={
                    <span className={styles.title}>
                      <UserOutlined />
                      <span className={styles.name}>{item.name}</span>
                      <MoreOutlined style={{ marginLeft: '30px' }} onClick={() => this.toggleActions(item)} />
                      <div className={styles.actions} hidden={!item.actionVisible}>
                        <Button onClick={this.openEdit} size="small" disabled={editStatus}>编辑</Button>
                        <Popconfirm
                          title="请确定删除该角色"
                          onConfirm={() => this.deleteRoleOK(item)}

                        >
                          <Button size="small">删除</Button>
                        </Popconfirm>
                      </div>
                    </span>
                  }
                  key={item.id}
                >
                  <Spin spinning={loading}>
                    <Tree
                      treeData={permissionsAllArr}
                      defaultExpandAll={true}
                      checkable={true}
                      className={styles.tree}
                      checkedKeys={checkedKeys}
                      onSelect={this.select}
                      onCheck={this.check}
                    />
                  </Spin>

                  <div className={styles.btns}>
                    <Button type="primary" style={{ marginRight: '10px' }} disabled={editStatus} onClick={this.openEdit}>编辑</Button>
                    <Button type="primary" ghost disabled={!editStatus} onClick={this.saveEdit}>保存权限</Button>
                  </div>
                </TabPane>
              )
            })
          }
        </Tabs>

        <Modal
          title="新增角色"
          visible={addRoleVisible}
          destroyOnClose={true}
          onOk={this.addRoleOK}
          onCancel={() => this.closeModal('addRoleVisible')}
        >
          <div className={styles.input}>
            <span>角色名称：</span>
            <Input placeholder="角色名称" onChange={this.setPername} minLength={2} maxLength={10} />
          </div>
        </Modal>
        <Button type="primary" icon={<PlusOutlined />} style={{ margin: '16px 10px' }} onClick={this.addRole}>新增角色</Button>
      </PageHeaderWrapper>
    )
  }
}

export default connect(({ menus }) => ({
  menus
}))(Role);
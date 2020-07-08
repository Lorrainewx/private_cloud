import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Table, Popconfirm, Button, Row, Col, Modal, TreeSelect, message, Select } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import SearchTree from '@/components/SearchTree';
import SearchTreewithMembers from '@/components/SearchTreewithMembers';
import SerachFormManage from './searchForm';
import { connect } from 'dva';
import { omit, uniqBy } from 'lodash';
import { formatterForMembers } from '@/utils/cloud';
import { Trim } from '@/utils/utils';
import styles from './index.less';
import { RESULT_STATUS } from '@/const/STATUS';

const { Option } = Select;

@connect(({ account, enterprise, corpAccount }) => ({
  account,
  adminMembersList: account.adminMembersList,
  enterprise,
  adminRoles: enterprise.adminRoles,
  departments: enterprise.departments,
  deleteResult: account.deleteResult,
  corpAccount,
}))
class AdminManage extends React.Component {
  state = {
    adminVisible: false,
    defaultExpandedKeys: [],  // 默认展开树
    addMembersListForId: [],  // 成员ID数组
    currentRole: undefined,  // 当前所选角色
    params: {
      size: 1000,
      page: 1,
    },
    selectUsers: [],
  }

  componentDidMount() {
    this.queryAdminRoles(); //企业管理员角色 
    this.queryAdminList();  // 管理员列表
    this.queryDepartments();  // 查询部门带成员结构的
    this.queryDpMemberList({ department: true }); // 分组成员
  }

  queryAdminList = () => {
    const { params } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'account/fetchMembers',
      payload: params,
    })
  }

  queryAdminRoles = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/getAdminRoles',
    })
  }

  queryDepartments = () => { // 组织架构
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchDepartments',
      payload: {
        members: true
      },
      callback: res => {
        if (res.code == RESULT_STATUS.SUCCESS) {
          let parentId = res.data[0].id;
          this.setState({ defaultExpandedKeys: [parentId] });
        }
      }
    })
  }

  deleteAdmin = role => {
    const { dispatch } = this.props;
    dispatch({
      type: 'account/deleteMember',
      payload: {
        memberId: role.id,
      },
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('删除成功');
          this.queryAdminList();
        }
      }
    })
  }

  addAdmin = () => {
    this.setState({ adminVisible: true });
  }
  // 确认选择角色及相对应的人员
  addAdminOK = () => {
    let { addMembersListForId, currentRole } = this.state;
    if (!currentRole) {
      message.error('请选择相应角色');
      return;
    }

    if (addMembersListForId.length == 0) {
      message.error('请选择相应成员');
      return;
    }

    addMembersListForId = addMembersListForId.filter(i => String(i).indexOf('member') > -1);

    let adminRoles = addMembersListForId.map(i => {
      let memberId = i && i.split('member')[1];
      return {
        adminRoleId: currentRole,
        memberId,
      }
    })
    this.addAdminAccount(adminRoles);
    this.closeModal('adminVisible');
  }

  addAdminAccount = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'account/addAdmin',
      payload: params,
      callback: res => {
        if (res && res.code === RESULT_STATUS.SUCCESS) {
          message.success('添加成功');
          this.queryAdminList();
          this.setState({ currentRole: undefined, selectUsers: [], addMembersListForId: [] });  //一切归零
        }
      }
    })
  }

  closeModal = type => {
    this.setState({ [type]: false });
    if (type == 'adminVisible') {
      this.setState({ selectUsers: [], addMembersListForId: [] })
    }
  }

  isMember = (value) => { // 过滤非成员账号
    let result = String(value).indexOf('member') > -1;
    return result;
  }

  // 转换为纯ID 无标识的
  translateToId = arr => {
    let newArr = [];
    for (let i of arr) {
      let mid = i.split('member')[1];
      newArr.push(mid);
    }
    return newArr;
  }

  checkMembers = (checkedKeys, info) => {
    this.setState({ addMembersListForId: checkedKeys });

    let {
      enterprise: { dpMembers },
    } = this.props;
    dpMembers = dpMembers && dpMembers.data || [];
    
    let checkedMidKeys = checkedKeys.filter(item => this.isMember(item));
    checkedMidKeys = this.translateToId(checkedMidKeys);
    // 取消选中
    if (checkedMidKeys.length == 0) {
      this.setState({ selectUsers: [] });
      return;
    }

    this.findSelectedKeysUserInfo(dpMembers, checkedMidKeys);
  }


  // 查找已选择的已分组用户信息
  findSelectedKeysUserInfo = (data, checkedKeys) => {

    // 选中
    let { selectUsers } = this.state;
    let membersArr = [];
    for (let item of data) {
      let members = item.members ? item.members : [];
      if (members.length == 0) {
        if (item.children && item.children.length > 0) {
          this.findSelectedKeysUserInfo(item.children, checkedKeys);
          // return;
        }
        // return;
      }
      let nselectUsers = members.filter(v => checkedKeys.includes(v.id));
      if (nselectUsers.length > 0) { 
        membersArr = membersArr.concat(nselectUsers);
        membersArr = membersArr.filter(v => checkedKeys.includes(v.id));
        selectUsers = selectUsers.filter(v => checkedKeys.includes(v.id));
        let newSelectUsers = selectUsers.concat(membersArr);
        this.setState({ selectUsers: uniqBy(newSelectUsers, 'id') }, () => {
          if (item.children && item.children.length > 0) {
            this.findSelectedKeysUserInfo(item.children, checkedKeys);
          }
        });
      } else {
        if (item.children && item.children.length > 0) {
          this.findSelectedKeysUserInfo(item.children, checkedKeys);
        }
      }      
    }
  }

  handleScreen = roleId => {
    let params = Object.assign({}, this.state.params, { roleId });
    this.setState({ params }, () => {
      this.queryAdminList();
    })
  }

  handleSearch = name => {
    let params = Object.assign({}, this.state.params, { name: Trim(name) });
    this.setState({ params }, () => {
      this.queryAdminList();
    })
  }

  handleReset = () => {
    let { params } = this.state;
    params = omit(params, ['name', 'roleId']);  //一切归零
    this.setState({ params }, () => {
      this.queryAdminList();
    })
  }

  cancelChoose = (user) => {
    let { selectUsers, addMembersListForId } = this.state;
    let newList = selectUsers.filter(item => item.id != user.id);
    addMembersListForId = addMembersListForId.filter(item => item != `member${user.id}` && this.isMember(item));

    this.setState({
      selectUsers: newList,
      addMembersListForId,
    });
  }

  queryMemberInfoItem = (mid, cb) => {  // 成员信息
    const { dispatch } = this.props;
    dispatch({
      type: 'corpAccount/fetchMemInfo',
      payload: { mid },
      callback: res => {
        cb && typeof cb == 'function' && cb(res);
      }
    })
  }

  changeAdminRole = value => {
    this.setState({ currentRole: value });
  }

  columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 150,
    }, {
      title: '所属部门',
      dataIndex: 'departments',
      key: 'departments',
      align: 'center',
      width: 250,
      render: text => text.map((i, index) => <span key={i.id}>{i.name}{index < text.length - 1 && `、`}</span>)
    }, {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center',
      width: 200,
    }, {
      title: '角色',
      dataIndex: 'adminRole',
      key: 'adminRole',
      align: 'center',
      width: 180,
      render: text => <span>{text.name}</span>
    }, {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        return (
          <Popconfirm
            title={() => <span>请确定删除{record.name}的{record.adminRole.name}权限， <br /> 删除后该成员将不会有该角色权限</span>}
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.deleteAdmin(record)}
            onCancel={() => null}
            disabled={record.isCreator}
          >            
            <Button type="link" danger disabled={record.isCreator}>删除</Button>
          </Popconfirm>
        )
      }
    }
  ]

  queryDpMemberList = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchDepartmentsMemberList',
      payload: { ...params },
    })
  }

  render() {
    const { adminVisible, defaultExpandedKeys, addMembersListForId, currentRole, selectUsers } = this.state;
    let {
      adminMembersList,
      adminRoles,
      departments,
    } = this.props;
    let departmentWithmembers = departments && departments.data || [];
    departmentWithmembers = formatterForMembers(departmentWithmembers);
    adminRoles = adminRoles && adminRoles.data || [];

    adminMembersList = adminMembersList && adminMembersList.data || {};
    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>管理员管理</Typography.Title>

        <Row gutter={16}>
          <Col span={4}>
            <Button type="primary" ghost onClick={this.addAdmin} style={{ margin: '30px 0 20px' }}>添加管理员</Button>
          </Col>
          <Col span={20}>
            <SerachFormManage
              roles={adminRoles}
              handleScreen={this.handleScreen}
              handleSearch={this.handleSearch}
              handleReset={this.handleReset}
            />
          </Col>
        </Row>

        <Table
          columns={this.columns}
          dataSource={adminMembersList.content}
          scroll={{ x: 800 }}
          pagination={false}
          // pagination={{
          //   current: adminMembersList && adminMembersList.number + 1,
          //   total: adminMembersList && adminMembersList.totalElements,
          //   pageSize: adminMembersList && adminMembersList.size,
          //   showQuickJumper: true,
          // }}
          rowKey="id"
        />

        <Modal
          title="选择成员"
          width="650px"
          visible={adminVisible}
          onOk={this.addAdminOK}
          destroyOnClose={true}
          onCancel={() => this.closeModal('adminVisible')}
        >
          <Select
            onChange={this.changeAdminRole}
            value={currentRole}
            placeholder="请选择企业角色"
            style={{ width: '400px', marginBottom: '10px' }}
          >
            {
              adminRoles.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)
            }
          </Select>
          {/* {
            <p className={styles.validate}>请选择企业角色</p>
          } */}

          <SearchTreewithMembers
            placeholder="搜索成员姓名"
            treeData={departmentWithmembers}
            showAddDepbtn={false}
            defaultExpandedKeys={defaultExpandedKeys}
            checkable={true}
            checkedKeys={addMembersListForId}
            onCheck={this.checkMembers}
            dataSource={selectUsers}
            deletemem={this.cancelChoose}
          />
        </Modal>
      </PageHeaderWrapper>
    )
  }
}

export default AdminManage;
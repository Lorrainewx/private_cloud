import React, { Children } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Table, Row, Col, Popconfirm, Button, Modal, Form, Input, Radio, Avatar, Select, TreeSelect, Tabs, message, Upload } from 'antd';
import { UserOutlined, CloseCircleFilled, PlusCircleOutlined } from '@ant-design/icons';
import SearchTree from '@/components/SearchTree';
import SearchTreewithMembers from '@/components/SearchTreewithMembers';

import SearchFormOrgStructure from './searchForm/index';
import { connect } from 'dva';
import { omit, filter } from 'lodash';
import { RESULT_STATUS } from '@/const/STATUS';
import defaultSetting from '../../../../config/defaultSettings';
import NetHandler from '@/utils/pomelo/netHandler';
import { deepCopy, jsonToArray } from '@/utils/utils';
import { formatterForMembers, formatterForTreeData } from '@/utils/cloud';
import { isBlankReg, isPhoneStr, isEmailStr, isPwStr, isDpnameStr, isAccountStr } from '@/utils/reg';

import styles from './index.less';
import enterprise from '@/data/enterprise';
const { Option } = Select;
const { TabPane } = Tabs;

const { devAuth } = defaultSetting;


@connect(({ enterprise, corpAccount, loading, }) => ({
  enterprise,
  corpAccount,
  loading: loading.effects['corpAccount/fetchMembers']
}))
class OrgStructure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      dVisible: false,  // 增加部门弹框
      editVisible: false, // 编辑用户信息弹框
      resetPVisible: false, // 重置密码弹框
      deleteVisible: false, // 删除成员确认弹框
      nameVisible: false, // 名称修改弹框
      addMVisible: false, // 成员增加弹框
      departmentParent: '', // 当前父部门
      defaultExpandedKeys: [],  // 默认展开树
      defaultExpandedKeysPrefix: [],
      operation: 0, // 当前操作ID
      currentDepartmentMembersInfo: [], // 部门成员信息列表
      currentDepartmentMembers: {}, // 当前部门员工列表
      currentUserInfo: {},  //当前用户详情
      canChoose: false, // 增加子部门
      addMembersListForId: [], // 添加已分组成员 ID列表
      addMembersListnoGpForId: [],  // 未分组成员 IC列表
      addmemberList: [],  // 添加的成员列表
      addmemberListnoGroup: [], // 添加的未分组成员信息列表
      enterpriseId: 0,
      isInit: true, // 获取部门信息 及其详细信息
      deleteDepartmentTitle: "确认删除该部门吗？ 确认后，该部门下的文件会一并删除", // 删除部门提示语
      reset: false, // 重置条件
      currentMembersTotal: 0, // 当前部门人数总数
      updateMemBDPVisible: false, // 批量修改部门弹框
      params: {
        name: '',
        pageSize: 10,
        pageNum: 1,
      },
      departmentRoles: [],  // 成员所有的角色
      corpRoles: [],  // 企业角色
      dpNamesArray: [], // 部门名称集合
      totalNumberCurDp: 0, // 当前部门总人数
      destroyOnClose: false,
    }
  }

  componentDidMount() {
    this.queryDepartments();  // 所有部门
    this.queryCorpRoles();  //角色
    // this.queryAdminRoles(); //管理员角色
  }

  queryDepartments = () => { // 组织架构
    const { dispatch } = this.props;
    const { isInit } = this.state;  // 初始状态
    dispatch({
      type: 'enterprise/fetchDepartments',
      payload: {
        members: true
      },
      callback: (res) => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          let departmentLarge = res.data.filter(i => i.parentId == 0 || !i.parentId)[0];
          let parentKey = departmentLarge.id;
          let {
            enterprise: { curDepartment },
          } = this.props;
          curDepartment = curDepartment && curDepartment.data || {};  // 当前部门信息

          isInit && this.getDepartmentDetailInfo(parentKey);
          isInit && this.getCurrentDpMembersCount(res.data, parentKey);
          !isInit && this.getCurrentDpMembersCount(res.data, curDepartment.id);

          this.setState({
            enterpriseId: parentKey,
            defaultExpandedKeys: [parentKey],
            defaultExpandedKeysPrefix: ['a' + parentKey],
            isInit: false,
          });
        }
      }
    })
  }

  queryDpMemberList = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchDepartmentsMemberList',
      payload: { ...params },
    })
  }

  clearDpMembers = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/clearMemListfetchMemNum'
    })
  }

  queryCorpRoles = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/getCorpRoles'
    })
  }

  queryAdminRoles = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/getAdminRoles'
    })
  }

  queryCurDepartment = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchDepartment',
      payload: { id },
      callback: res => {
        if (!res || res.code != RESULT_STATUS.SUCCESS) return;
        this.setState({
          departmentParent: `a${id}`,
          isInit: false,
        })
      }
    })
  }

  queryCorpMemNum = departmentId => {  // 部门成员数量
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchMemNum',
      payload: {
        departmentId,
      }
    })
  }

  queryMembersList = (otherParams = {}) => {  // 部门成员列表
    let params = Object.assign({}, this.state.params, { ...otherParams });
    const { dispatch } = this.props;
    dispatch({
      type: 'corpAccount/fetchMembers',
      payload: params
    })
    this.setState({ params });
  }

  queryMemberInfoList = (checkedMids, group = true) => {
    let addmemberList = [];
    if (checkedMids.length == 0) {
      if (group) {
        this.setState({ addmemberList: [] });
      } else {
        this.setState({ addmemberListnoGroup: [] });
      }
    }
    for (let item of checkedMids) {
      let mid = item.split('member')[1];
      this.queryMemberInfoItem(mid, (res) => {
        addmemberList.push(res.data);
        if (group) {  // 分组成员添加的列表
          this.setState({ addmemberList });
        } else {  // 未分组成员添加的列表
          this.setState({ addmemberListnoGroup: addmemberList });
        }
      })
    }
  }

  queryMemberInfoItem = (mid, cb) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'corpAccount/fetchMemInfo',
      payload: { mid },
      callback: res => {
        cb && typeof cb == 'function' && cb(res);
      }
    })
  }

  deletemem = (user, group = true) => { // 取消选中成员
    let { addmemberList, addmemberListnoGroup, addMembersListForId, addMembersListnoGpForId } = this.state;
    if (group) {  // 分组
      let newList = addmemberList.filter(item => item.id != user.id);

      addMembersListForId = addMembersListForId.filter(item => item != `member${user.id}` && this.isMember(item));

      this.setState({
        addmemberList: newList,
        addMembersListForId,
      });
    } else {  // 未分组
      let newList = addmemberListnoGroup.filter(item => item.id != user.id);
      addMembersListnoGpForId = addMembersListnoGpForId.filter(item => item != `member${user.id}` && this.isMember(item));
      this.setState({
        addmemberListnoGroup: newList,
        addMembersListnoGpForId
      });
    }
  }

  joinDepartment = (params, cb) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'corpAccount/addUsers',
      payload: params,
      callback: res => {
        if (res && res.code === RESULT_STATUS.SUCCESS) {
          this.setState({
            addmemberList: [],
            addmemberListnoGroup: [],
            addMembersListnoGpForId: [],
            addMembersListForId: [],
          })
          this.queryMembersList({ departmentId: params.departmentId });
          cb && typeof cb == 'function' && cb(res);
        }
      }
    })
  }

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  changeAccountState = (params, state) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'corpAccount/changeAccountState',
      payload: {
        memberId: String(params.id),
        state,
      },
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('操作成功');
          this.queryMembersList();
          this.setState({ selectedRowKeys: [], operation: 0 });
        }
      }
    })
  }

  editUser = (record) => {
    this.queryMemberInfoItem(record.id, (res) => {
      if (res && res.code === RESULT_STATUS.SUCCESS) {
        const { dispatch } = this.props;
        let currentUserInfo = res.data;
        this.setState({
          currentUserInfo,
          departmentRoles: currentUserInfo && currentUserInfo.departmentRoles,
        }, () => {
          this.setState({ editVisible: true });
        });
      }
    });
  }

  removeUser = (memberId) => {
    const { dispatch, enterprise: { curDepartment } } = this.props;
    const departmentId = curDepartment && curDepartment.data && curDepartment.data.id;
    dispatch({
      type: 'corpAccount/moveUsers',
      payload: {
        memberId: String(memberId),
        departmentId
      },
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('移除成功');
          this.queryMembersList();
        }
      }
    })
  }

  deleteUser = (record) => {
    this.deleteUserAccount([record.id]);
  }

  deleteType = (user) => {

  }

  editUserInfoOK = (values) => {
    // 提交参数 确认修改用户信息
    const { corpRoles, departmentRoles } = this.state;
    // 部门不可重复
    for (let item of departmentRoles) {
      let isSameDp = departmentRoles.filter(i => i.departmentId == item.departmentId).length > 1;
      let isEmpty = departmentRoles.filter(i => i.id == null || i.departmentId == null).length > 0;
      if (isSameDp) {
        message.error('部门重复, 请重新选择');
        return;
      }
      if (isEmpty) {
        message.error('请先选择部门和对应角色');
        return;
      }
    }

    this.editUserInfo({
      ...values,
      corpRoles,
      departmentRoles
    });
    this.closeModal('editVisible');
  }

  editUserInfo = (params) => {
    const { dispatch } = this.props;
    const { currentUserInfo: { id } } = this.state;
    let newParams = omit(params, 'roles');
    dispatch({
      type: 'corpAccount/updateUser',
      payload: { ...newParams, id },
      callback: res => {
        if (res && res.code === RESULT_STATUS.SUCCESS) {
          message.success('保存成功');
          this.queryDepartments();
          this.queryMembersList();
        }
      }
    })
  }

  onChangeforUserInfo = (changedFields, allFields) => {

  }

  createDepartment = async (data) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/createDepartment',
      payload: { ...data },
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('添加成功');
          this.queryDepartments();
        }
      }
    })
  }

  addDepartment = (canChoose = false) => {
    this.setState({ dVisible: true, canChoose });
  }

  addDepartmentOK = (values) => {
    const { description, name } = values;
    let { enterprise: { departments } } = this.props;
    departments = departments && departments.data || [];  // 所有部门
    this.hasSameName(departments);
    const { departmentParent, dpNamesArray } = this.state;
    if (dpNamesArray.includes(name)) {
      message.error('不可出现同名部门');
      return;
    }
    const data = {
      name,
      description,
      parentId: departmentParent.split('a')[1]
    }
    this.createDepartment(data);
    this.closeModal('dVisible');
  }

  addNewMember = () => {
    this.setState({ addMVisible: true });
  }

  addNewMemberOK = (values) => {  // 确认添加新成员
    const { enterprise: { curDepartment } } = this.props;
    const departmentId = curDepartment && curDepartment.data && curDepartment.data.id;
    // 增加成员接口
    const { dispatch } = this.props;
    const epInfo = localStorage.getItem('epInfo') && JSON.parse(localStorage.getItem('epInfo')) || {};

    dispatch({
      type: 'corpAccount/create',
      payload: {
        ...values,
        departments: [
          {
            id: departmentId
          }
        ],
        account: `${values.account}`
      },
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('添加成功！');
          this.setState({ destroyOnClose: true });
          this.queryMembersList({ departmentId });
          this.queryCorpMemNum(departmentId);
          this.queryDepartments();
        }
      }
    })
    this.closeModal('addMVisible');
  }

  addAlreadyMemOK = (group = true) => { // 确认添加已有成员
    let { addMembersListForId, addMembersListnoGpForId } = this.state;
    let { curDepartment } = this.props.enterprise;
    curDepartment = curDepartment && curDepartment.data;
    
    if (group) { // 添加分组成员
      if (addMembersListForId.length == 0) {
        message.error('未选择成员');
        return;
      }

      addMembersListForId = addMembersListForId.filter(item => this.isMember(item));
      let newData = addMembersListForId.map(i => i.split("member")[1]);
      this.joinDepartment({ departmentId: curDepartment.id, memberId: String(newData) }, res => {
        message.success('添加成功');
        this.setState({ destroyOnClose: true });
        this.queryMembersList({ departmentId: curDepartment.id });
        this.queryCorpMemNum(curDepartment.id);
      })
    } else {
      if (addMembersListnoGpForId.length == 0) {
        message.error('未选择成员');
        return;
      }
      addMembersListnoGpForId = addMembersListnoGpForId.filter(item => this.isMember(item));
      let newData = addMembersListnoGpForId.map(i => i.split("member")[1]);
      this.joinDepartment({ departmentId: curDepartment.id, memberId: String(newData) }, res => {
        message.success('添加成功');
        this.setState({ destroyOnClose: true });
        this.queryMembersList({ departmentId: curDepartment.id });
        this.queryCorpMemNum(curDepartment.id);
      });
    }

    this.closeModal('addMVisible');
  }

  isMember = (value) => { // 过滤非成员账号
    let result = String(value).indexOf('member') > -1;
    return result;
  }

  chooseParent = key => {
    this.setState({ departmentParent: key });
    // 真实字段ID key.split('a')[1]
  }

  onChangeforOperation = value => {
    this.setState({ operation: value });
  }

  deleteMembers = () => {
    const { selectedRowKeys } = this.state;
    this.setState({ deleteVisible: true });
  }

  deleteMembersOK = () => {
    // 提交删除请求
    const { selectedRowKeys } = this.state;
    this.deleteUserAccount(selectedRowKeys);
    this.closeModal('deleteVisible');
  }

  deleteUserAccount = (memberIds) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'corpAccount/deleteMember',
      payload: {
        memberId: String(memberIds)
      },
      callback: res => {
        if (res && res.code === RESULT_STATUS.SUCCESS) {
          if (res.data.count > 0) {
            message.success('删除成功');
            this.queryMembersList();
            this.setState({ selectedRowKeys: [], operation: 0 });
          } else {
            message.error('删除失败');
          }
        }
      }
    })
  }

  resetPassward = () => {
    this.setState({ resetPVisible: true });
  }

  resetPwdOK = values => {
    // 提交修改密码的接口
    let { selectedRowKeys } = this.state;
    let { password } = values;

    const { dispatch } = this.props;
    dispatch({
      type: 'corpAccount/resetPwd',
      payload: {
        memberId: String(selectedRowKeys),
        password,
      },
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('重置成功');
          this.setState({ selectedRowKeys: [], operation: 0 });
        }
      }
    })
    this.closeModal('resetPVisible');
  }

  treeItemClick = (departmentId) => {
    let params = Object.assign({}, this.state.params, { pageNum: 1, name: '', departmentId });
    params = omit(params, ['roleId', 'frozen']); // 切换部门， 一切归零

    let {
      enterprise: { departments },
    } = this.props;
    departments = departments && departments.data || [];  // 所有部门
    this.getCurrentDpMembersCount(departments, departmentId);

    this.setState({
      params,
      reset: true,
      isInit: false,
      selectedRowKeys: [],
    }, () => {
      this.getDepartmentDetailInfo(departmentId);
    });
  }

  getDepartmentDetailInfo = (departmentId) => {
    const { enterpriseId } = this.state;
    let { enterprise: { curDepartment } } = this.props;
    let parentId = curDepartment && curDepartment.data && curDepartment.data.parentId;
    this.queryCurDepartment(departmentId);  // 当前部门详情    
    this.queryCorpMemNum(departmentId); // 当前部门成员数量

    this.queryMembersList({ departmentId });

    this.setState({ departmentParent: 'a' + departmentId });
  }

  handlePageChange = (pageNumber, pageSize) => {  // 成员信息 页码查询
    let params = Object.assign({}, this.state.params, { pageNum: pageNumber });
    this.setState({ params }, () => {
      // 搜索成员信息
      this.queryMembersList();
    });
  }

  handleSearch = (value, type) => { // 内容筛选/搜索
    let params = Object.assign({}, this.state.params, { [type]: value });
    this.setState({
      params,
      reset: false,
    }, () => {
      this.queryMembersList({ [type]: value });
    })
  }

  handleReset = () => { // 重置检索条件
    const { enterpriseId } = this.state;
    let params = Object.assign({}, this.state.params, { pageSize: 10, pageNum: 0 });
    params = omit(params, ['name', 'roleId', 'frozen']);
    this.setState({
      params,
      reset: true,
    }, () => {
      this.getDepartmentDetailInfo(params.departmentId || enterpriseId);
    });
  }

  deleteDepartment = (curDepartment) => {
    const { id, parentId } = curDepartment;
    const { canDelete } = this.state;
    if (!canDelete) return;
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/dropDepartment',
      payload: { id },
      callback: res => {
        if (res && res.code === RESULT_STATUS.SUCCESS) {
          message.success('删除成功');
          this.queryDepartments();
          this.getDepartmentDetailInfo(parentId);
        }
      }
    })
  }

  departmentCanDelete = (currentDepartmentdetailInfo) => {
    const { children, roleMembers, members } = currentDepartmentdetailInfo;
    const hasmembers = roleMembers.length > 0 && roleMembers[0].members.length > 0; // 是否有成员
    const hasSubdp = children.length > 0; // 是否有子部门
    if (hasmembers || hasSubdp) {
      this.setState({
        canDelete: false, // 不可删除
        deleteDepartmentTitle: '无法删除，当前部门下仍有子部门/部门成员',
      });
      return;
    } else {
      this.setState({
        canDelete: true,
        deleteDepartmentTitle: '确认删除该部门吗？ 确认后，该部门下的文件会一并删除',
      });
    }
  }

  editDName = () => {
    this.setState({ nameVisible: true });
  }

  editDNameOK = (values, curDpInfo) => {
    const { id } = curDpInfo;
    const data = {
      id,
      name: values.name,
    }

    this.updateDepartmentInfo(data);
    this.closeModal('nameVisible');
  }

  updateDepartmentInfo = (data) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/updateDepartment',
      payload: { ...data },
      callback: res => {
        if (res && res.code === RESULT_STATUS.SUCCESS) {
          message.success('修改成功');
          this.loadDepartment(data.id);
        }
      }
    })
  }

  loadDepartment = id => {
    this.queryDepartments();
    this.queryCurDepartment(id);  // 当前部门详情    
    this.queryCorpMemNum(id); // 当前部门成员数量
  }

  closeModal = (type) => {
    this.setState({ [type]: false });
    // 编辑用户信息
    if (type === 'editVisible') {
      // this.setState({ currentUserInfo: {} });
      this.clearUser();
    }
  }

  clearUser = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'corpAccount/clearUser'
    })
  }

  // 分组成员
  checkMembers = (checkedKeys, info) => {
    this.setState({ addMembersListForId: checkedKeys }, () => {
      const checkedMidKeys = checkedKeys.filter(item => this.isMember(item));
      this.queryMemberInfoList(checkedMidKeys);
    });
  }

  selectMembers = (selectedKeys, info) => {

  }

  // 未分组成员
  checknoGroupMembers = (checkedKeys, info) => {
    this.setState({ addMembersListnoGpForId: checkedKeys }, () => {
      const checkedMidKeys = checkedKeys.filter(item => this.isMember(item));
      this.queryMemberInfoList(checkedMidKeys, false);
    });
  }


  hasSameName(array) {  // 同名XXXXX
    let { dpNamesArray } = this.state;

    for (let item of array) {
      if (item.name) {
        dpNamesArray.push(item.name);
      }
      if (item.children) {
        this.hasSameName(item.children);
      }
    }

    this.setState({ dpNamesArray });
  }

  // 部门名称
  validateToDName = (_, value) => {
    let result = !value || (isDpnameStr(value) && !isBlankReg(value));
    if (result) {
      return Promise.resolve();
    } else {
      if (isBlankReg(value)) return Promise.reject('请输入部门名称');
      if (!isDpnameStr(value)) return Promise.reject('请输入中英数字或包含（）、-三种特殊字符的组合');
    }
  }

  // 手机
  validateToPhone = (_, value) => {   // 验证 手机号
    let result = value && !isBlankReg(value) && isPhoneStr(value);  // 手机格式 必填
    if (result) {
      return Promise.resolve();
    } else {
      if (isBlankReg(value)) return Promise.reject('请输入手机号码');
      if (value != null && !isPhoneStr(value)) return Promise.reject('手机号格式有误');
    }
  };

  // 登录账号
  validateAccount = (_, value) => {
    let result = !value || isAccountStr(value);
    if (result) {
      return Promise.resolve();
    } else {
      return Promise.reject('请输入1-20位英文数字或组合');
    }
  }

  // 密码
  validateTopw = (_, value) => {
    let result = !value || isPwStr(value);
    if (result) {
      return Promise.resolve();
    } else {
      return Promise.reject('请输入6-20位英文数字或组合');
    }
  }

  // 姓名
  // validateToUserName = (_, value) => {
  //   let result = value && !isBlankReg(value) && value.trim().length <= 20;  // 1-20字符以内 必填
  //   if (result) {
  //     return Promise.resolve();
  //   } else {
  //     if (value.length > 0 && isBlankReg(value)) return Promise.reject('请输入真实姓名');
  //     if (value.trim().length > 20) return Promise.reject('请输入1-20位中英文，支持特殊字符');
  //   }
  // }

  // 邮箱
  validateToEmail = (_, value) => {
    let result = isEmailStr(value);
    if (result || !value) {
      return Promise.resolve();
    } else {
      return Promise.reject('邮箱格式有误');
    }
  }

  openUpdateMemberJoinModal = () => {
    this.setState({ updateMemBDPVisible: true });
  }

  columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
      width: 150,
    },
    {
      title: '职位',
      dataIndex: 'position',
      align: 'center',
      width: 400,
    },
    {
      title: '手机',
      dataIndex: 'phone',
      align: 'center',
      width: 80,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      align: 'center',
      width: 180,
      render: (text, record) => {
        if (!text) return;
        return text.map(item => <span key={item.id}>{item.name}</span>)
      }
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 200,
      render: (_, record) => {
        const { isFrozen } = record;
        let content = !isFrozen ? '禁用' : '启用';
        return <>
          <Button onClick={() => this.editUser(record)} type="link">编辑</Button>
          <Popconfirm
            title={`您确定要${content}该员工账户吗？`}
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.changeAccountState(record, !isFrozen ? 1 : 0)}
            onCancel={() => null}
          >
            <Button type="link" danger>{content}</Button>
          </Popconfirm>
          <Popconfirm
            title="您确定要移除该员工账户吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.removeUser(record.id)}
            onCancel={() => null}
          >
            <Button type="link" danger>移除</Button>
          </Popconfirm>
          <Popconfirm
            title="您确定要删除该员工账户吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.deleteUser(record)}
            onCancel={() => null}
          >
            <Button type="link" danger onClick={() => this.deleteType(record)}>删除</Button>
          </Popconfirm>
        </>
      }
    }
  ];

  renderBatchResetPassward = () => {
    const { resetPVisible } = this.state;
    return (
      <Modal
        title="批量修改密码"
        visible={resetPVisible}
        onCancel={() => this.closeModal('resetPVisible')}
        footer={null}
      >
        <Form
          layout="horizontal"
          onFinish={this.resetPwdOK}
        >
          <Form.Item label="输入密码：" name="password">
            <Input.Password
              placeholder="输入重置密码"
              rules={[
                { required: true, message: '请输入重置密码' },
                { validator: async (_, value) => await this.validateTopw(_, value) }
              ]}
            />
          </Form.Item>
          <div className={styles.btns}>
            <Button htmlType="button" onClick={() => this.closeModal('resetPVisible')}>取消</Button>
            <Button htmlType="submit" type="primary" style={{ marginLeft: '10px' }}>确定</Button>
          </div>
        </Form>
      </Modal>
    )
  }

  renderAddDepartmentModal = (expandedKeys, departments) => {
    let { dVisible, defaultExpandedKeysPrefix, canChoose } = this.state;

    return (
      <Modal
        title="新增部门"
        visible={dVisible}
        destroyOnClose={true}
        onCancel={() => this.closeModal('dVisible')}
        footer={null}
      >
        <Form
          layout="horizontal"
          className={`${styles.form}`}
          onFinish={this.addDepartmentOK}
        >
          <Form.Item label="上级部门：">
            <TreeSelect
              value={expandedKeys}
              treeData={formatterForTreeData(departments, 'a')}
              treeExpandedKeys={defaultExpandedKeysPrefix}
              onChange={this.chooseParent}
              disabled={canChoose}
            />
          </Form.Item>
          <Form.Item
            label="部门名称："
            name="name"
            rules={[
              { required: true, message: '请输入部门名称' },
              { validator: async (_, value) => await this.validateToDName(_, value) }
            ]}
          >
            <Input placeholder="部门名称" autoComplete="off" maxLength={20} />
          </Form.Item>
          <Form.Item label="部门描述：" name="description">
            <Input.TextArea rows={4} placeholder="部门描述" autoComplete="off" maxLength={40} />
          </Form.Item>
          <div className={styles.btns}>
            <Button htmlType="button" onClick={() => this.closeModal('dVisible')}>取消</Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: '10px' }}>确定</Button>
          </div>
        </Form>
      </Modal>
    );
  }
  //选择角色
  selectCorpRoles = value => {
    let corpRoles = [{ id: value }];
    this.setState({ corpRoles });
  }
  // 选择部门角色 
  selectDepartmentRoles = (value, dpId) => {
    let { departmentRoles } = this.state;
    let { enterprise: { corpRoles }, } = this.props;

    let currentRole = departmentRoles.filter(item => item.departmentId == dpId)[0]; // 当前角色
    let modifyCurrentRole = { ...currentRole, id: value };  // 修改后的角色
    modifyCurrentRole = omit(modifyCurrentRole, ['name', 'departName']);
    let list = departmentRoles.map(t => {
      return t.departmentId === modifyCurrentRole.departmentId
        ? modifyCurrentRole
        : t;
    });

    this.setState({ departmentRoles: list });
  }

  // 选择对应部门
  selectDepartment = (value, index) => {
    const { departmentRoles } = this.state;
    let currentRole = departmentRoles[index]; // 当前角色
    let modifyCurrentRole = { ...currentRole, departmentId: value };  // 修改后的角色
    modifyCurrentRole = omit(modifyCurrentRole, ['name', 'departName']);

    // departId去重
    let isSame = departmentRoles.filter((i, j) => i.departmentId == value && j != index).length > 0;
    if (isSame) {
      message.error('部门重复, 请重新选择');
    }

    let list = departmentRoles.map((t, i) => {
      return i === index
        ? modifyCurrentRole
        : t;
    });

    this.setState({ departmentRoles: list });
  }

  // 删除角色
  deleteDepartments = item => {
    let { departmentRoles } = this.state;
    let newdepartmentRoles = [];
    newdepartmentRoles = filter(departmentRoles, i => { return i.departmentId != item.departmentId });
    this.setState({ departmentRoles: newdepartmentRoles });
  }

  // 新增角色
  addDpRole = () => {
    let { departmentRoles } = this.state;
    let newRole = [{ id: null, departmentId: null }];
    departmentRoles = departmentRoles.concat(newRole);
    this.setState({ departmentRoles });
  }

  renderUserIndoEditModal = (initialValues, treeData, corpRolesList, adminRoles) => {
    const { editVisible, enterpriseId, defaultExpandedKeys, departmentRoles } = this.state;

    // 初始数据处理
    let { roles, departmentIds } = initialValues;
    roles = roles ? roles.map(item => item.role.id) : [];
    let newInitialValues = { ...initialValues, roles };
    departmentIds = departmentIds ? departmentIds.filter(i => i != enterpriseId) : [];
    let defaultAvatar = `${devAuth}/epauth/resources/avatar/default.jpg`;

    return (
      <Modal
        title="用户信息编辑"
        onCancel={() => this.closeModal('editVisible')}
        width={850}
        visible={editVisible}
        destroyOnClose={true}
        footer={null}
      >
        <Form
          className={`${styles.form} ${styles.editForm}`}
          layout="horizontal"
          onFieldsChange={this.onChangeforUserInfo}
          onFinish={this.editUserInfoOK}
          initialValues={newInitialValues}
        >
          <Row gutter={32} style={{ maxHeight: '600px', padding: '20px 0', overflowY: 'auto' }}>
            <Col span={11}>
              <div className={styles.accountInfo}>
                <Avatar
                  style={{ backgroundColor: '#87d068', marginRight: '10px' }}
                  size="large"
                  src={newInitialValues.avatar ? `${devAuth}/epauth${newInitialValues.avatar}` : defaultAvatar}
                />
                <span>{newInitialValues && newInitialValues.account}</span>
              </div>
              <Form.Item
                label="姓名"
                name="name"
                rules={[
                  { required: true, message: '请输入姓名' },
                ]}
              >
                <Input placeholder="姓名" autoComplete="off" minLength={1} maxLength={20} />
              </Form.Item>
              <Form.Item label="企业角色">
                <Select
                  placeholder="企业角色"
                  defaultValue={
                    initialValues.corpRoles && initialValues.corpRoles[0] && initialValues.corpRoles[0].id
                  }
                  onSelect={this.selectCorpRoles}
                >
                  {
                    adminRoles.map(item => {
                      return (
                        <Option value={item.id} key={item.id}>{item.name}</Option>
                      )
                    })
                  }
                </Select>
              </Form.Item>
              <Form.Item label="职位" name="position">
                <Input placeholder="职位" autoComplete="off" minLength={2} maxLength={10} />
              </Form.Item>
              <Form.Item label="工号：" name='jobNo'>
                <Input placeholder="工号" autoComplete="off" minLength={2} maxLength={10} />
              </Form.Item>
              <Form.Item
                label="邮箱："
                name="email"
                rules={[
                  { validator: async (_, value) => await this.validateToEmail(_, value) }
                ]}
              >
                <Input placeholder="邮箱" autoComplete="off" />
              </Form.Item>
              <Form.Item label="性别：" name="sex">
                <Radio.Group>
                  <Radio value={1}>男</Radio>
                  <Radio value={2}>女</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label="手机："
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号码' },
                  { validator: async (_, value) => await this.validateToPhone(_, value) }
                ]}
              >
                <Input placeholder="手机" autoComplete="off" />
              </Form.Item>
              <Form.Item
                label="密码："
                name="password"
                rules={[
                  { validator: async (_, value) => await this.validateTopw(_, value) }
                ]}
              >
                <Input.Password
                  placeholder="密码"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              {
                departmentRoles && departmentRoles.map((item, index) => {
                  return (
                    <div className={styles.formItem} key={index}>
                      <CloseCircleFilled className={styles.delete} onClick={() => this.deleteDepartments(item)} />
                      <Form.Item label="角色">
                        <Select
                          placeholder="角色"
                          value={item.id}
                          onSelect={(value) => this.selectDepartmentRoles(value, item.departmentId)}
                        >
                          {
                            corpRolesList.map(itemm => {
                              return (
                                <Option value={itemm.id} key={itemm.id}>{itemm.name}</Option>
                              )
                            })
                          }
                        </Select>
                      </Form.Item>
                      <Form.Item label="部门：">
                        <TreeSelect
                          treeData={treeData}
                          value={item.departmentId}
                          treeDefaultExpandedKeys={defaultExpandedKeys}
                          multiple={false}
                          placeholder="部门"
                          onSelect={value => this.selectDepartment(value, index)}
                        />
                      </Form.Item>
                    </div>
                  )
                })
              }

              <Button
                type="primary"
                ghost
                icon={<PlusCircleOutlined />}
                style={{ border: 'none', boxShadow: 'none' }}
                onClick={this.addDpRole}
              >新增角色</Button>
            </Col>
          </Row>

          <div className={styles.btns}>
            <Button onClick={() => this.closeModal('editVisible')}>取消</Button>
            <Button type="primary" style={{ marginLeft: '10px' }} htmlType="submit" >确定</Button>
          </div>
        </Form>
      </Modal>
    )
  }

  onTabchange = (tab) => {
    switch (tab) {
      case "2":
        // 分组成员
        // this.clearDpMembers();
        this.queryDpMemberList({ department: true });
        break;
      case "3":
        // 未分组成员
        // this.clearDpMembers();
        this.queryDpMemberList({ department: false });
        break;
    }
  }

  renderAddMemberModal = (membersTree, membersTreeOutGroup) => {
    const {
      addMVisible,
      destroyOnClose,
      defaultExpandedKeys,
      addmemberList,
      addMembersListForId,
      addmemberListnoGroup,
      addMembersListnoGpForId,
    } = this.state;

    const epInfo = localStorage.getItem('epInfo') && JSON.parse(localStorage.getItem('epInfo')) || {};

    return (
      <Modal
        title="新增成员"
        visible={addMVisible}
        width="650px"
        onCancel={() => this.closeModal('addMVisible')}
        destroyOnClose={destroyOnClose}
        footer={null}
      >
        <Tabs defaultActiveKey="1" type="card" onChange={this.onTabchange}>
          <TabPane tab="添加新成员" key="1">
            <Form
              layout="horizontal"
              className={`${styles.form} ${styles.formlabel}`}
              onFinish={this.addNewMemberOK}
            >
              <Form.Item
                label="登录账号："
                name="account"
                rules={[
                  { required: true, message: '请输入登录账号' },
                  { validator: async (_, value) => await this.validateAccount(_, value) }
                ]}
              >
                <Input placeholder="登录账号" autoComplete="off" maxLength={20} />
              </Form.Item>
              <Form.Item
                label="初始密码："
                name="password"
                rules={[
                  { validator: async (_, value) => await this.validateTopw(_, value) }
                ]}>
                <Input.Password
                  placeholder="初始密码"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={20}
                />
              </Form.Item>
              <Form.Item
                label="真实姓名："
                name="name"
                rules={[
                  { required: true, message: '请输入真实姓名' },
                ]}
              >
                <Input placeholder="真实姓名" autoComplete="off" minLength={1} maxLength={20} />
              </Form.Item>
              <Form.Item label="性别：" name="sex">
                <Radio.Group placeholder="选择性别">
                  <Radio value={1}>男</Radio>
                  <Radio value={2}>女</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label="手机号码："
                name='phone'
                rules={[
                  { required: true, message: '请输入手机号码' },
                  { validator: async (_, value) => await this.validateToPhone(_, value) }
                ]}
              >
                <Input placeholder="手机号码" autoComplete="off" />
              </Form.Item>
              <Form.Item
                label="邮箱："
                name="email"
                rules={[
                  { validator: async (_, value) => await this.validateToEmail(_, value) }
                ]}
              >
                <Input placeholder="邮箱" autoComplete="off" />
              </Form.Item>
              <Form.Item
                label="职务："
                name='position'
              >
                <Input placeholder="职务" autoComplete="off" minLength={2} maxLength={10} />
              </Form.Item>
              <Form.Item
                label="工号："
                name="jobNo"
              >
                <Input placeholder="工号" autoComplete="off" minLength={2} maxLength={10} />
              </Form.Item>
              <Form.Item label="备注：" name="comment">
                <Input.TextArea rows={4} placeholder="备注" autoComplete="off" maxLength="40" />
              </Form.Item>
              <div className={styles.btns}>
                <Button htmlType="button" onClick={() => this.closeModal('addMVisible')}>取消</Button>
                <Button htmlType="submit" type="primary" style={{ marginLeft: '10px' }}>确定</Button>
              </div>
            </Form>
          </TabPane>
          <TabPane tab="添加已分组成员" key="2">
            <SearchTreewithMembers
              placeholder="搜索成员姓名"
              defaultExpandedKeys={defaultExpandedKeys}
              treeData={membersTree}
              showAddDepbtn={false}
              checkable={true}
              checkedKeys={addMembersListForId}
              onCheck={this.checkMembers}
              onSelect={this.selectMembers}
              dataSource={addmemberList}
              deletemem={this.deletemem}
            />
            <div className={styles.btns}>
              <Button htmlType="button" onClick={() => this.closeModal('addMVisible')}>取消</Button>
              <Button type="primary" onClick={this.addAlreadyMemOK} style={{ marginLeft: '10px' }}>确定</Button>
            </div>
          </TabPane>
          <TabPane tab="添加未分组成员" key="3">
            <SearchTreewithMembers
              placeholder="搜索成员姓名"
              defaultExpandedKeys={defaultExpandedKeys}
              treeData={membersTreeOutGroup}
              showAddDepbtn={false}
              checkable={true}
              checkedKeys={addMembersListnoGpForId}
              onCheck={this.checknoGroupMembers}
              onSelect={this.selectMembers}
              dataSource={addmemberListnoGroup}
              deletemem={this.deletemem}
              group={false}
            />
            <div className={styles.btns}>
              <Button htmlType="button" onClick={() => this.closeModal('addMVisible')}>取消</Button>
              <Button type="primary" onClick={() => this.addAlreadyMemOK(false)} style={{ marginLeft: '10px' }}>确定</Button>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    )
  }

  modifyDp = (values, selectedRowKeys) => {
    let { enterprise: { curDepartment }, } = this.props;
    curDepartment = curDepartment && curDepartment.data || {};  // 当前部门信息
    let srcId = curDepartment.id; // 当前部门
    this.moveDp({ ...values, srcId, memberId: String(selectedRowKeys) });
    this.closeModal('updateMemBDPVisible');
  }

  moveDp = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'corpAccount/moveDp',
      payload: params,
      callback: res => {
        if (res.code == RESULT_STATUS.SUCCESS) {
          message.success('修改成功');
          this.setState({ selectedRowKeys: [], operation: 0 });
          this.queryMembersList();
        }
      }
    })
  }

  renderUpdateMemBDPModal = (corpRolesList, treeData, defaultExpandedKeys, curMembersData) => {
    const { updateMemBDPVisible, selectedRowKeys } = this.state;
    let selectedRows = curMembersData.filter(i => selectedRowKeys.includes(i.id));

    return (
      <Modal
        visible={updateMemBDPVisible}
        title="批量修改部门"
        onCancel={() => this.closeModal('updateMemBDPVisible')}
        footer={null}
      >
        <p style={{ marginBottom: 0 }}>将修改以下员工部门和角色</p>
        {selectedRows.map(i => { return <span key={i.id} className={styles.itemP}>{i.name}</span> })}

        <Form
          onFinish={(values) => this.modifyDp(values, selectedRowKeys)}
          style={{ marginTop: '20px' }}
        >
          <Form.Item label="角色" name="roleId">
            <Select placeholder="角色">
              {
                corpRolesList.map(item => {
                  return (
                    <Option value={item.id} key={item.id}>{item.name}</Option>
                  )
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="部门：" name="destId">
            <TreeSelect
              treeData={treeData}
              treeDefaultExpandedKeys={defaultExpandedKeys}
              multiple={false}
              placeholder="部门"
            />
          </Form.Item>
          <div className={styles.btns}>
            <Button type="primary" ghost onClick={() => this.closeModal('updateMemBDPVisible')} style={{ marginRight: '10px' }}>取消</Button>
            <Button type="primary" htmlType="submit">确定</Button>
          </div>
        </Form>
      </Modal>
    )
  }

  getCurrentDpMembersCount = (departments, id) => {
    departments.map(item => {
      if (id && item.id == id) {
        this.setState({ totalNumberCurDp: item.membersCount });
      } else {
        if (item.children) {
          this.getCurrentDpMembersCount(item.children, id);
        }
      }
    })
  }

  render() {
    const {
      selectedRowKeys,
      departmentParent,
      defaultExpandedKeys,
      operation,
      deleteVisible,
      nameVisible,
      enterpriseId,
      deleteDepartmentTitle,
      params,
      reset,
      currentUserInfo,
      totalNumberCurDp,
    } = this.state;

    let {
      enterprise: { departments, curDepartment, corpRoles, membersNumResult, dpMembers, adminRoles },
      corpAccount: { membersResult, memberInfo },
      loading,
    } = this.props;

    // 数据处理
    departments = departments && departments.data || [];  // 所有部门
    dpMembers = dpMembers && dpMembers.data || [];
    curDepartment = curDepartment && curDepartment.data || {};  // 当前部门信息
    let corpRolesList = corpRoles && corpRoles.data || [];  // 角色列表
    // let totalNumber = membersNumResult && membersNumResult.data && membersNumResult.data.totalUniq; // 总人数
    let curMembersData = JSON.stringify(membersResult) != "{}" && membersResult.data;
    adminRoles = adminRoles && adminRoles.data || [];

    const { name, id, parentId } = curDepartment;

    const departmentsTree = formatterForTreeData(departments);  // 不带成员的树形图
    const membersTree = formatterForMembers(dpMembers);  // 分组成员的树形图
    const membersTreeOutGroup = formatterForMembers(dpMembers, false); // 未分组成员

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const haschoose = selectedRowKeys.length > 0;
    const layoutCol1 = {
      xxl: 6,
      xl: 24,
    }
    const boxStyle = {
      textAlign: 'center',
      border: 'none',
      background: 'transparent',
      margin: 0,
      padding: 0
    }

    let disabled = enterpriseId == curDepartment.id;

    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>组织架构</Typography.Title>
        <Row gutter={20}>
          <Col span={6}>
            <SearchTree
              placeholder="搜索部门"
              treeData={departmentsTree}
              addDepartment={() => this.addDepartment(false)}
              defaultExpandedKeys={defaultExpandedKeys}
              onSelect={this.treeItemClick}
              draggable={true}
              showAddDepbtn={true}
            />
          </Col>
          <Col span={18} style={{ border: '1px solid #eeeeeee' }}>
            <div className={styles.title} style={{ marginBottom: '15px' }}>
              <span>{curDepartment.name}({totalNumberCurDp}人)</span>
              <div className={styles.actions} style={{ display: 'inline', marginLeft: '10px' }}>
                <Button onClick={this.editDName} type="link" style={{ marginRight: '10px' }} disabled={disabled}>修改名称</Button>/
                <Button onClick={() => this.addDepartment(true)} type="link" style={{ marginRight: '10px' }}>添加子部门</Button>/
                <Popconfirm
                  title={deleteDepartmentTitle}
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.deleteDepartment(curDepartment)}
                  onCancel={() => null}
                  disabled={disabled}
                >
                  <Button type="link" danger disabled={disabled} onClick={() => this.departmentCanDelete(curDepartment)}>删除</Button>
                </Popconfirm>
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <Button style={{ marginRight: '10px', position: 'relative', display: 'inline' }} type="primary" ghost onClick={this.addNewMember}>增加成员</Button>
              <Select placeholder="批量操作" value={operation} onChange={this.onChangeforOperation} disabled={!haschoose}>
                <Option value={0}>批量操作</Option>
                <Option value={1}><Button style={{ ...boxStyle }} onClick={this.openUpdateMemberJoinModal}>修改部门</Button></Option>
                <Option value={2}>
                  <Button style={{ ...boxStyle }} onClick={() => this.changeAccountState({ id: selectedRowKeys }, 1)}>禁用成员</Button></Option>
                <Option value={3}><Button onClick={this.resetPassward} style={{ ...boxStyle }}>重置密码</Button></Option>
                <Option value={4}><Button style={{ ...boxStyle }} onClick={() => this.removeUser(selectedRowKeys)}>移除成员</Button></Option>
                <Option value={5}><Button onClick={this.deleteMembers} style={{ ...boxStyle }}>删除成员</Button></Option>
              </Select>
            </div>
            <SearchFormOrgStructure
              reset={reset}
              roles={corpRolesList}
              handleSearch={(v) => this.handleSearch(v, 'name')}
              handleChooseRole={(v) => this.handleSearch(v, 'roleId')}
              handleReset={this.handleReset}
              chooseAccountType={(v) => this.handleSearch(v, 'frozen')}
            />
            <Table
              loading={loading}
              columns={this.columns}
              dataSource={curMembersData && curMembersData.content || []}
              rowSelection={rowSelection}
              scroll={{ x: 900 }}
              rowKey="id"
              pagination={{
                total: curMembersData && curMembersData.totalElements,
                current: params.pageNum,
                size: 'small',
                pageSize: 10,
                // showQuickJumper: true,
                onChange: this.handlePageChange,
              }}
            />
            {this.renderUserIndoEditModal(currentUserInfo, departmentsTree, corpRolesList, adminRoles)}
            {this.renderAddDepartmentModal(departmentParent, departments)}
            {this.renderBatchResetPassward()}
            {this.renderAddMemberModal(membersTree, membersTreeOutGroup)}
            {this.renderUpdateMemBDPModal(corpRolesList, departmentsTree, defaultExpandedKeys, curMembersData && curMembersData.content || [])}
            <Modal
              title="您确定要删除该员工吗？"
              visible={deleteVisible}
              onOk={this.deleteMembersOK}
              onCancel={() => this.closeModal('deleteVisible')}
              content={null}
              className={styles.dmodal}
            >
            </Modal>

            <Modal
              title="修改部门名称"
              visible={nameVisible}
              destroyOnClose={true}
              onCancel={() => this.closeModal('nameVisible')}
              footer={null}
            >
              <Form
                name="editDpName"
                layout="horizontal"
                onFinish={(values) => this.editDNameOK(values, curDepartment)}
                initialValues={curDepartment}
              >
                <Form.Item
                  label="部门名称："
                  name="name"
                  rules={[
                    { required: true, message: '请输入部门名称' },
                    { validator: async (_, value) => await this.validateToDName(_, value) }
                  ]}
                >
                  <Input placeholder="部门名称" maxLength={20} autoComplete="off" />
                </Form.Item>
                <div className={styles.btns}>
                  <Button htmlType="button" onClick={() => this.closeModal('nameVisible')}>取消</Button>
                  <Button type="primary" htmlType="submit" style={{ marginLeft: '10px' }}>确定</Button>
                </div>
              </Form>
            </Modal>
          </Col>
        </Row>
      </PageHeaderWrapper>
    )
  }
}

export default OrgStructure;

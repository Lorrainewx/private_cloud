import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Row, Col, Modal, Form, Input, Progress, message } from 'antd';
import { connect } from 'dva';
import NetHandler from '@/utils/pomelo/netHandler';
import SliderItem from './components/SliderItem';
import { RESULT_STATUS } from '@/const/STATUS';
import styles from './index.less';

@connect(({ packet, enterprise }) => ({
  modifySpaceLimit: packet.modifySpaceLimit,
  enterprise,
}))
class SpaceMent extends React.Component {
  state = {
    totalSpace: {},
    groupSpace: { total: 1024, used: 0 },
    departSpace: { total: 1024, used: 0 },
    memberSpace: { total: 1024, used: 0 },
    dpLargeId: 0,
  }

  componentDidMount() {
    this.getCurrentEnterpriseInfo();
    this.queryDepartments();
    this.queryCorpRoles();  // 角色
  }

  onSpaceChange = (type, value) => {
    this.setState({
      [type]: value,
    });
  };

  handleOk = async (values, spaceType) => {
    let { spaceLimit } = values;
    spaceLimit = Number(spaceLimit);
    switch(spaceType) {
      case 'departSpace':
        let res = await NetHandler.setDepartmentSpaceInfo({ spaceLimit });
        if(this.noresult(res)) return;
        message.success('修改成功');
        let { dpLargeId } = this.state;
        this.getCurrentDepartment(dpLargeId);
        break;
      case 'groupSpace':
        this.modifySpaceLimit({ size: spaceLimit });
        break;
      case 'memberSpace':
        console.log(values, spaceType);
        let { departmentId, roleId } = values;
        this.setMemberSpaceByDepartment({
          departmentId,
          space: spaceLimit,
          roleId: !!roleId ? roleId : -1,
        });
        break;
    }
  }

  // 批量修改成员空间
  setMemberSpaceByDepartment = (data) => {
    let res = NetHandler.setMemberSpaceByDepartment(data);
    console.log(res);

    if(this.noresult(res)) return;
    message.success('修改成功');
  }


  // 修改群组空间上限
  modifySpaceLimit = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'packet/spaceLimit',
      payload: params,
    })
  }

  // 获取系统空间
  getCurrentEnterpriseInfo = async () => {  // 当前企业信息
    let currentEpInfoResult = await NetHandler.getCurrentEnterpriseInfo();
    if (this.noresult(currentEpInfoResult)) return;
    const { enterprise } = currentEpInfoResult;
    const { upgradeCapacity, basicCapacity, usedSpace } = enterprise;
    this.setState({
      totalSpace: { total: upgradeCapacity + basicCapacity, name: '总空间', used: usedSpace },
    });
  }

  // 组织架构
  queryDepartments = () => { // 组织架构
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchDepartments',
      callback: res => {
        if (res && res.code === RESULT_STATUS.SUCCESS) {
          console.log(res.data);
          let { data } = res;
          let parentId = data[0].id;
          this.setState({ dpLargeId: parentId }, () => {
            this.getCurrentDepartment(parentId);
          })
        }
      }
    })
  }

  // 获取部门空间
  getCurrentDepartment = async (departmentId) => { // 部门信息
    let departmentLarge = await NetHandler.getDepartmentDetailInfo({ departmentId }); // 部门信息（公司最大部门）
    if(this.noresult(departmentLarge)) return;

    const { curDepartment: { spaceLimit, usedSpace, memberCount, personalSpace, epSpaceLimit }, } = departmentLarge;

    this.setState({
      departSpace: { used: usedSpace, total: epSpaceLimit },
      memberSpace: { used: personalSpace, total: epSpaceLimit },
    });
  }

  // 部门角色
  queryCorpRoles = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/getCorpRoles'
    })
  }

  formatterForTreeData = (data, unique = null) => {
    const newData = data && data.map(item => {
      let { parentId, id, name, children } = item;
      let key = id;
      if (!!unique) {
        key = unique + id;
      }

      return {
        parent: parentId ? parentId : 0,
        id,
        title: name,
        key,
        value: key,
        children: this.formatterForTreeData(children, unique),
      }
    })
    return newData;
  }

  noresult = (result) => {
    if(!result || result.resultCode != RESULT_STATUS.SUCCESS) return true;
  }

  render() {
    const { totalSpace, groupSpace, departSpace, memberSpace, } = this.state;
    const allSpace = 2;

    let {
      enterprise: { corpRoles, departments },
    } = this.props;

    let corpRolesList = corpRoles && corpRoles.data || [];  // 角色列表
    corpRolesList = corpRolesList.filter(item => !!item.corpId);
    departments = departments && departments.data || [];  // 所有部门

    const departmentsTree = this.formatterForTreeData(departments);  // 不带成员的树形图

    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>空间管理</Typography.Title>


        <SliderItem
          min={1}
          max={1024}
          spaceValue={totalSpace}
          allSpace={allSpace}
          name='系统'
          showTextChange={false}
          spaceType='systemSpace'
          onSpaceChange={this.onSpaceChange}
        />
        <SliderItem
          min={1}
          max={1024}
          spaceValue={departSpace}
          allSpace={allSpace}
          name='部门'
          showTextChange={true}
          spaceType='departSpace'
          onSpaceChange={this.onSpaceChange}
          handleOk={this.handleOk}
        />
        <SliderItem
          min={1}
          max={1024}
          spaceValue={groupSpace}
          allSpace={allSpace}
          name='群组'
          showTextChange={true}
          spaceType='groupSpace'
          onSpaceChange={this.onSpaceChange}
          handleOk={this.handleOk}
        />
        <SliderItem
          min={1}
          max={1024}
          spaceValue={memberSpace}
          allSpace={allSpace}
          name='个人'
          showTextChange={true}
          spaceType='memberSpace'
          corpRoles={corpRolesList}
          treeData={departmentsTree}
          handleOk={this.handleOk}
          onSpaceChange={this.onSpaceChange}
        />
      </PageHeaderWrapper>
    )
  }
}

export default SpaceMent;

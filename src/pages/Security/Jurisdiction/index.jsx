import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { CheckCircleFilled, EditFilled, DeleteFilled } from '@ant-design/icons';
import { Typography, Row, Col, Button, Modal, Radio, Select, Checkbox, Input, Form, message } from 'antd';
import { RESULT_STATUS } from '@/const/STATUS';
import { connect } from 'dva';
import NetHandler from '@/utils/pomelo/netHandler';
import styles from './index.less';

const { Option } = Select;

@connect(({ permission }) => ({
  permission
}))
class Jurisdiction extends React.Component {
  state = {
    filePermissions: [],
    filePermissionsArr: [],
    managerPermissions: [],
    roles: [],
    addRoleVisible: false,
    replaceVisible: false,
    roleVisible: false,
    oldRoleId: 0,
    newRoleId: 0,
    roles_count: 0,
    type: 0,
    chooseAlreadyRoleId: 0,
    role: {
      managerPermission: 0,
      filePermission: 0,
    },  // 空角色
    roleempty: {
      default: 2,
      enterpriseId: '10402',
      name: "",
    },
    addRole: {} //新增的角色
  }
  componentDidMount() {
    this.queryAllRoleandPermission();
  }

  queryAllRoleandPermission = async () => { // 所有文件权限
    let res = await NetHandler.getAllDepartmentRolesAndPermission();
    if (this.noresult(res)) return;
    let { filePermissions, managerPermissions, roles } = res;

    let id = roles[0].id; // 默认值 角色中的第一个
    this.setState({
      filePermissions,
      filePermissionsArr: filePermissions.map((i, index) => Math.pow(2, index)),
      roles,
      oldRoleId: id,
      newRoleId: id,
      chooseAlreadyRoleId: id,
      roles_count: roles.length,
      managerPermissions,
    })
  }

  noresult = (result) => {
    if (!result || result.resultCode !== RESULT_STATUS.SUCCESS) return true;
  }

  addRoleChange = e => {
    this.setState({ type: e.target.value });
  }

  addroleCheck = (e, index) => {
    this.setState({ [index]: e.target.checked });
  }

  addNewRoles = () => {
    this.setState({ addRoleVisible: true });
  }

  addNewRolesOK = () => {
    let { role, type, chooseAlreadyRoleId, roles, roles_count } = this.state;
    this.setState({ roleVisible: true });
    switch (type) {
      case 1:
        role = roles.filter(item => item.id == chooseAlreadyRoleId)[0];
        this.setState({ role });
        break;
      default:
        this.setState({ chooseAlreadyRoleId: 0 });
        this.setState({ role });
        break;
    }
    this.closeModal('addRoleVisible');
  }

  chooseAlreadyRole = value => {
    let { roles } = this.state;
    let role = roles.filter(item => item.id == value)[0]
    let { filePermission, managerPermission } = role
    this.setState({ chooseAlreadyRoleId: value });
  }


  addNewRolesSubmit = (values) => {
    let { role } = values;
    const { dispatch } = this.props;
    let { roles, roles_count, chooseAlreadyRoleId, type, role: copyRole } = this.state;
    // if (chooseAlreadyRoleId && role.name == values.name) {
    //   message.error('请修改角色名称')
    //   return false;
    // }
    let filePermission = 0,
        managerPermission = 0;
    let params = {
      role,
    };
    if(type == 1) {
      params.fromRoleId = chooseAlreadyRoleId;
      filePermission = copyRole.filePermission;
      managerPermission = copyRole.managerPermission;
    }
    dispatch({
      type: 'permission/addRole',
      payload: params,
      callback: res => {
        if(res && res.code == RESULT_STATUS.SUCCESS) {
          let addRole = { 
            ...res.data, 
            filePermission, 
            managerPermission, 
            editStatus: true,
          };
          this.setState({ 
            roles_count: roles_count + 1,  
            roles: roles.concat([addRole]),
          });
        }
      }
    })

    this.closeModal('roleVisible');
    // dispatch({
    //   type: 'roles/addRole',
    //   payload: {
    //     role: name
    //   },
    //   callback: (res) => {
    //     if (res.code == 0) {
    //       let id = res.data.id + '';
    //       let name = res.data.name;
    //       let tempRole = {};
    //       let params = Object.assign({}, this.state.addRole, { id, name });
    //       if (chooseAlreadyRoleId) {
    //         tempRole = roles.filter(item => item.id == chooseAlreadyRoleId)[0]
    //         let { filePermission, managerPermission } = tempRole
    //         if (typeof (filePermission) == "string") {
    //           filePermission = parseInt(filePermission)
    //         }
    //         if (typeof (managerPermission) == "string") {
    //           managerPermission = parseInt(managerPermission)
    //         }
    //         tempRole = Object.assign({}, tempRole, { filePermission, managerPermission, name });
    //       } else {
    //         tempRole.id = id;
    //         tempRole.name = name;
    //       }
    //       this.setState({ addRole: tempRole }, () => {
    //         this.addDepartmentRole()
    //       });

    //       // this.setState({
    //       //   addRole:{
    //       //     id:id,
    //       //     name:name
    //       //   }
    //       // },()=>{
    //       //   this.addDepartmentRole()
    //       // })



    //     }
    //   }
    // })
  }
  // addDepartmentRole = async () => {
  //   console.log('this.state', this.state.addRole);
  //   let { roles, role, roles_count, addRole } = this.state;
  //   let { name, id } = this.state.addRole
  //   let filePermission = this.state.addRole.filePermission ? this.state.addRole.filePermission : 0
  //   let managerPermission = this.state.addRole.managerPermission ? this.state.addRole.managerPermission : 0
  //   this
  //   let data = {
  //     filePermission: filePermission,
  //     name: name,
  //     managerPermission: managerPermission
  //   }
  //   let res = await NetHandler.addDepartmentRole(data);
  //   if (this.noresult(res)) return;
  //   if (res) {
  //     roles.push({ ...addRole, name: name, editStatus: true });
  //     this.setState({ roles, roles_count: Number(roles_count) + 1 });
  //     this.closeModal('roleVisible');
  //   }
  // }

  // editRole = () => {
  // }

  replaceRole = () => {
    this.setState({ replaceVisible: true });
  }

  replaceRoleOK = () => {
    const { oldRoleId, newRoleId } = this.state;
    if (oldRoleId == newRoleId) {
      message.error('角色不变');
      return;
    }
    this.migrateDepartmentRoleTo({
      newRoleId: Number(newRoleId) - 0,
      oldRoleId: Number(oldRoleId) - 0,
    })

    this.closeModal('replaceVisible');
  }

  migrateDepartmentRoleTo = async (data) => {
    let res = await NetHandler.migrateDepartmentRoleTo(data);
    if (this.noresult(res)) return;
    message.success('替换成功');
    this.queryAllRoleandPermission();
  }

  oldRole = value => {
    this.setState({ oldRoleId: value });
  }

  newRole = (value) => {
    this.setState({ newRoleId: value });
  }

  closeModal = type => {
    this.setState({ [type]: false, });
  }

  deletePermission = (id) => {
    let { dispatch } = this.props;
    dispatch({
      type: 'permission/deleteRole',
      payload: { 
        id,
      },
      callback: res => {
        if(res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('删除成功');
          this.queryAllRoleandPermission();
        }        
      }
    })    
  }

  changeName = (e, role) => {
    let name = e.target.value;
    let { roles } = this.state;
    let newRoles = roles.map(i => {
      if (i.id == role.id) {
        return {
          ...i,
          name,
        }
      } else return { ...i };
    });
    this.setState({ roles: newRoles });
  }

  EditPermission = (role) => {
    let { roles } = this.state;
    let newRoles = roles.map(i => {
      if (i.id == role.id) {
        return {
          ...i, editStatus: !i.editStatus
        }
      } else return { ...i };
    });
    this.setState({ roles: newRoles });   // 编辑与不可编辑状态
  }

  changeDpRolePermission = (role) => {
    let { roles } = this.state;
    let newRoles = roles.map(i => {
      if (i.id == role.id) {
        return {
          ...i, editStatus: !i.editStatus
        }
      } else return { ...i };
    });
    this.setState({ roles: newRoles });
    let { filePermission, id, managerPermission, name } = role;
    managerPermission = managerPermission ? managerPermission : 0
    let options = {
      name,
      managerPermission: Number(managerPermission),
      filePermission,
    }
    this.changeRoleInfo({
      options,
      roleId: Number(id),
    })
  }

  changeRoleInfo = async (data) => {
    let res = await NetHandler.changeRoleInfo(data);
    if (this.noresult(res)) return;
    message.success('修改成功');
  }

  onCheckChange = (e, index, role, isAdd = false) => {
    let { filePermissionsArr, roles } = this.state;
    let len1 = filePermissionsArr.length;
    let { checked } = e.target;
    let filePermission,
      managerPermission;
    if (!checked) { // 移除权限
      if (index > len1) {
        index = index - len1 - 1;
        let newRole = this.removeManagePermissionValidate(index, role);
        managerPermission = this.changeBitToFalse(index, newRole.managerPermission);
      } else {
        let newRole = this.removeFilePermissionValidate(index, role);
        filePermission = this.changeBitToFalse(index, newRole.filePermission);
      }
    } else if (checked) { // 添加权限
      if (index > len1) {
        index = index - len1 - 1;
        let newRole = this.addManagePermissionValidate(index, role);
        managerPermission = this.changeBitToTrue(index, role.managerPermission);
      } else {
        let newRole = this.addFilePermissionValidate(index, role);
        filePermission = this.changeBitToTrue(index, newRole.filePermission);
      }
    }

    filePermission = filePermission || role.filePermission;
    managerPermission = managerPermission || role.managerPermission;

    let newRoles = roles.map(i => {
      if (i.id == role.id) {
        return {
          ...i,
          filePermission,
          managerPermission,
        }
      } else {
        return i;
      }
    });

    this.setState({ roles: newRoles });
    if (isAdd) {
      let params = Object.assign({}, this.state.addRole, { filePermission, managerPermission });
      filePermission = filePermission ? filePermission : 0;
      managerPermission = managerPermission ? managerPermission : 0;
      this.setState({ params })
    } console.log({ ...role, filePermission, managerPermission });
  }

  removeFilePermissionValidate = (index, role) => { // 取消文件权限相关联动
    let elevantArr = [];
    switch (index) {
      case 0:
        elevantArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
        break;
      case 3:
        elevantArr = [4, 8, 9];
        break;
      case 4:
        elevantArr = [9];
        break;
      case 8:
        elevantArr = [9];
        break;
      case 10:
        elevantArr = [11];
        break;
      case 12:
        elevantArr = [13];
        break;
      case 14:
        elevantArr = [5, 6, 15, 16, 17];
        break;
      case 5:
        elevantArr = [6, 21];
        break;
      case 6:
        elevantArr = [21];
        break;
      case 1:
        elevantArr = [8, 9, 10, 11, 19, 20];
        break;
      case 2:
        elevantArr = [10, 11];
        break;
      case 19:
        elevantArr = [9, 11, 20];
        break;
      case 29:
        elevantArr = [21];
        break;
    }

    let newRole = role;
    for (let i of elevantArr) {
      newRole.filePermission = this.changeBitToFalse(i, newRole.filePermission);
    }
    return newRole;
  }

  addFilePermissionValidate = (index, role) => {  // 增加文件相关联动
    let elevantArr = [];
    switch (index) {
      case 1:
      case 2:
      case 3:
      case 7:
      case 12:
      case 14:
      case 18:
        elevantArr = [0];
        break;
      case 4:
        elevantArr = [0, 3];
        break;
      case 5:
        elevantArr = [0, 14];
        break;
      case 8:
        elevantArr = [0, 1, 3];
        break;
      case 9:
        elevantArr = [0, 1, 3, 4, 8, 19];
        break;
      case 10:
        elevantArr = [0, 1, 2];
        break;
      case 11:
        elevantArr = [0, 10, 1, 2, 19];
        break;
      case 13:
        elevantArr = [0, 12];
        break;
      case 15:
      case 16:
      case 17:
        elevantArr = [0, 14];
        break;
      case 6:
        elevantArr = [0, 5, 14];
        break;
      case 19:
        elevantArr = [0, 1];
        break;
      case 20:
        elevantArr = [0, 1, 19];
        break;
      case 21:
        elevantArr = [0, 6, 5, 29];
        break;
    }

    let newRole = role;
    for (let i of elevantArr) {
      newRole.filePermission = this.changeBitToTrue(i, newRole.filePermission);
    }
    return newRole;
  }

  fullPermission = 0xffffffff;

  changeBitToTrue = (index, value) => {   //
    var temp = 1 << index;
    return (temp) | value;
  }

  changeBitToFalse = (index, value) => {
    var temp = 1 << index;
    temp = this.fullPermission ^ temp;
    return temp & value;
  }

  addManagePermissionValidate = (index, role) => {  // 增加角色管理权限 联动
    let { filePermissionsArr, roles } = this.state;
    let len1 = filePermissionsArr.length;
    let elevantArr = [];
    switch (index) {
      case 1:
      case 2:
      case 8:
        elevantArr = [0];
        break
      case 3:
        elevantArr = [0, 2];
        break;
    }

    let newRole = role;
    for (let i of elevantArr) {
      newRole.managerPermission = this.changeBitToTrue(i, newRole.managerPermission);
    }
    return newRole;
    // 设置当前roles列表
  }

  removeManagePermissionValidate = (index, role) => {   // 去除角色管理权限 联动
    let { filePermissionsArr } = this.state;
    let len1 = filePermissionsArr.length;
    let elevantArr = [];
    switch (index) {
      case 0:
        elevantArr = [1, 2, 3, 8];
        break;
      case 2:
        elevantArr = [3];
        break;
    }

    let newRole = role;
    for (let i of elevantArr) {
      newRole.managerPermission = this.changeBitToFalse(i, newRole.managerPermission);
    }
    return newRole;
  }
  submitAddRole = (value) => {
    const { roles } = this.state;
    console.log(roles, 'submitAddRole roles')

  }
  render() {
    const {
      role,
      roles,
      filePermissions,
      filePermissionsArr,
      oldRoleId,
      newRoleId,
      roles_count,
      addRoleVisible,
      replaceVisible,
      type,
      roleVisible
    } = this.state;

    // console.log('filePermissions',filePermissions)
    // console.log('filePermissionsArr',filePermissionsArr)
    // console.log('role',role)
    // console.log('roles',roles)
    const radioStyle = {
      display: 'block'
    };

    const selectStyle = {
      width: '200px',
      marginLeft: '10px'
    };

    const iconStyle = {
      fontSize: '12px',
      color: '#888888',
      margin: '0 5px',
    }

    const firstColSpan = 6,
      othersColspans = 18,
      othersColspan = 75 / Number(roles_count);

    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>权限配置</Typography.Title>
        <div className={styles.actions} >
          <Button onClick={this.addNewRoles} style={{ marginRight: '10px' }} type="primary" ghost>新增角色</Button>
          <Button onClick={this.replaceRole} type="primary" ghost>角色替换</Button>
        </div>
        <Row>
          <Col span={firstColSpan}>
            <span className={styles.title}>权限种类</span>
            {
              filePermissions.map((item, index) => <span className={styles.desc} key={index}> {item}  </span>)
            }
            {/* <span className={`${styles.desc} ${styles.lastDesc}`}>角色数量统计</span> */}
          </Col>
          {
            roles && roles.map(item => {
              return (
                <Col style={{ width: `${othersColspan}%` }} key={item.id}>
                  <span className={styles.title}>
                    {!item.editStatus && <span className={styles.name}>{item.name}</span>}
                    {item.editStatus && <Input
                      value={item.name}
                      className={`${styles.titleInput} ${styles.title}`}
                      style={{ boxShadow: 'none' }}
                      onChange={(e) => this.changeName(e, item)}
                    />
                    }
                    <div className={styles.opes}>
                      {
                        !item.editStatus &&
                        <EditFilled style={{ ...iconStyle }} onClick={() => this.EditPermission(item)} />
                      }
                      {
                        item.editStatus &&
                        <Button
                          style={{ boxShadow: 'none', border: 'none' }}
                          type="primary"
                          ghost
                          size="small"
                          onClick={() => this.changeDpRolePermission(item)}
                        >确定</Button>
                      }
                      {item.default != 1 && <DeleteFilled style={{ ...iconStyle }} onClick={() => this.deletePermission(item.id)} />}
                    </div>
                  </span>
                  {
                    filePermissions.map((itemf, index) => {
                      const filePermissionFlag = filePermissionsArr[index] & item.filePermission;
                      // console.log('filePermissionFlag',filePermissionFlag)
                      return (
                        <span className={styles.desc} key={index}>
                          {
                            <Checkbox
                              style={{ color: '#0099FF' }}
                              checked={filePermissionFlag}
                              disabled={!item.editStatus}
                              onChange={(e) => this.onCheckChange(e, index, item)}
                            />
                          }
                        </span>
                      )
                    })
                  }
                  {/* <span className={`${styles.desc} ${styles.lastDesc}`}>{item.count}</span> */}
                </Col>
              )
            })
          }
        </Row>
        <Modal
          title="请选择"
          visible={addRoleVisible}
          onOk={this.addNewRolesOK}
          destroyOnClose={true}
          onCancel={() => this.closeModal('addRoleVisible')}
        >
          <Radio.Group defaultValue={type} onChange={this.addRoleChange}>
            <Radio value={0} style={{ ...radioStyle }}>建立一个空角色</Radio>
            <Radio value={1} style={{ ...radioStyle }}>
              从已有角色复制
              <Select style={{ ...selectStyle }} onChange={this.chooseAlreadyRole}>
                {
                  roles && roles.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)
                }
              </Select>
            </Radio>
          </Radio.Group>
        </Modal>

        <Modal
          title="建立一个空角色"
          visible={roleVisible}
          footer={null}
          onCancel={() => this.closeModal('roleVisible')}
          destroyOnClose={true}
          width="600px"
        >

          <Form
            layout="inline"
            onFinish={this.addNewRolesSubmit}
            className={styles.form}
            initialValues={role}
          >
            <div className={styles.role}>
              <Form.Item
                label="角色"
                name="role"
                rules={[
                  {
                    required: true,
                    message: '请输入角色名',
                  },
                ]}
              >
                <Input placeholder="角色" autoComplete="off" />
              </Form.Item>
            </div>
            <div className={styles.btns}>
              <Button htmlType="button" onClick={() => this.closeModal('roleVisible')}>取消</Button>
              <Button htmlType="submit" type="primary" style={{ marginLeft: '10px' }}>确定</Button>
            </div>
          </Form>
        </Modal>

        <Modal
          title="角色替换"
          visible={replaceVisible}
          onOk={this.replaceRoleOK}
          onCancel={() => this.closeModal('replaceVisible')}
        >
          <div className={styles.item}>
            <span>旧有角色：</span>
            <Select
              style={{ ...selectStyle }}
              onChange={this.oldRole}
              value={oldRoleId}
            >
              {
                roles && roles.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)
              }
            </Select>
          </div>
          <div className={styles.item}>
            <span>替换为：</span>
            <Select
              style={{ ...selectStyle }}
              onChange={this.newRole}
              value={newRoleId}
            >
              {
                roles && roles.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)
              }
            </Select>
          </div>
        </Modal>
      </PageHeaderWrapper>
    )
  }
}

export default Jurisdiction;

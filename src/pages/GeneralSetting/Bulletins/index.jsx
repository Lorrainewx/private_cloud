import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import moment from 'moment';
import {
  Typography,
  Table,
  Button,
  Modal,
  Form,
  DatePicker,
  Input,
  Radio,
  Tabs,
  TreeSelect,
  Popconfirm,
  List,
  Avatar,
  Row,
  Col,
  message
} from 'antd';
import SearchFormBulletinsManage from './searchForm';
import {timestampToTime, timestampToTime2} from '@/utils/utils';
import styles from './index.less';
import { connect } from 'dva';

import {omit} from "lodash";
import SearchTree from "@/components/SearchTree";
import defaultSettings from "../../../../config/defaultSettings";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { SHOW_PARENT } = TreeSelect;
const { devAuth } = defaultSettings;

const errMessage ={
  title:'请填写公告标题',
  content:'请填写公告内容',
  publishTime:'请选择公告显示时间',
}
const stateObj = {
  '0': '待发布',
  '1': '已发布',
  '2': '已过期',
  '3': '已删除',
}

@connect(({ notice,enterprise,loading}) => ({
  notice,
  enterprise,
  loading: loading.effects['notice/getNoticeList']
}))

class BulletinsManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      dVisible: false,
      diyVisible: false,
      readVisible: false,
      edit: false,
      noticeType: 0,
      members: [],
      currentBulletins: {},
      errInfo:'',
      errVisible:false,
      startValue:null,
      noticeInfo:{},
      selectedRowKeys: [],
      isValue:false, //是否是编辑Modal
      xqVisible:false, //公告详情显示
      params: {
        page: 1,
        limit: 10,
      },

    }
  }

  componentDidMount() {
    this.getNoticeList()
    this.queryDpMemberList({ department: true })

  }
  queryDpMemberList=(params)=>{
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchDepartmentsMemberList',
      payload: { ...params },
    })
  }
  getNoticeList = (param)=>{
    const { params } = this.state;
    // let params = param ? param:{}
    const {dispatch} = this.props;
    dispatch({
      type:'notice/getNoticeList',
      payload: params
    })
  }
  submitPublish = (values,ty )=> {
    const { dispatch} = this.props;
    let {content,noticeTitle } = values;
    let type,id;
    if(ty){
      type = ty.currentBulletins.status ==0?'notice/noticeEdit':'notice/addWithPublish'
      id = ty.currentBulletins.id;
    }
    if(!noticeTitle){
      message.error(errMessage.title)
      return
    }
    if(!content){
      message.error(errMessage.content)
      return
    }
    if(!values.publishTime){
      message.error(errMessage.publishTime)
      return
    }
    let {noticeType} = this.state;
    let userIds ='';
    if (noticeType){
      userIds =  this.state.members
    }
    let startTime= values.publishTime[0].format("YYYY-MM-DD HH:mm"); //"2020-06-18T16:07:06+08:00"
    let endTime= values.publishTime[1].format("YYYY-MM-DD HH:mm");
    var time = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()+ ' ' + new Date().getHours()+ ':' + new Date().getMinutes()
    if(new Date(startTime) < new Date(time)){
      message.error('公告显示时间不能早于当前时间哦')
      return;
    }
    dispatch({
      type:type,
      payload: {
        'content': content,
        'endTime': endTime,
        'noticeTitle': noticeTitle,
        'noticeType': noticeType, //全部人员或者部分人员
        'startTime': startTime,
        'userIds':userIds,
        "id":id
      },
      callback:(data)=>{
        if(data.success){
          this.getNoticeList()
          if(this.state.isValue){
            message.success('编辑成功')
          }else{
            message.success('发布成功')
          }

        }

      }
    })
    this.setState({ visible: false });
  }
  //获取公告列表

  disabledStartDate = (startValue) => {//打开开始时间面板调用的函数
    return startValue.valueOf() > new Date().getTime();
  }
  query = otherParams => {

  }
  onSelectChange = selectedRowKeys => {
    console.log('已选择列 ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };
  handlePageChange = (pageNum, pageSize) => {
    let params = Object.assign({}, this.state.params, { page: pageNum });
    console.log('params',params);
    this.setState({ params }, () => {
      this.getNoticeList();
    });
  }

  closeModal = () => {
    this.setState({ xqVisible: false });
  }

  lookBulletins = bId => {
    const {dispatch} = this.props;
    dispatch({
      type:'notice/noticeInfo',
      payload:{
        id:bId
      },
      callback:(res)=>{

        this.setState({noticeInfo:res.data})
        console.log(this.state.noticeInfo,'++++++++++=')
      }
    })
    this.setState({ edit: false, xqVisible: true });
  }

  editBulletins = record => {
    this.setState({ edit: true, visible: true, currentBulletins: record,isValue:true });
  }
  addBulletins = () => {
    this.setState({ edit: true, visible: true,isValue:false,currentBulletins:'' });
  }
  //删除公告
  deleteBulletins = bId => {
    const { dispatch } = this.props;
    dispatch({
        type:'notice/deleteNotice',
        payload:{
          id:bId
        },
        callback:(data)=>{
          if(data.success){
            message.success('删除成功')
            this.getNoticeList();
          }
        }
      })
  }
  //批量删除公告
  batchDel=(data)=>{
    const { dispatch } = this.props;
    let ids = [];
    data.map((id) => {ids.push(parseInt(id))})
    dispatch({
      type:'notice/batchDel',
      payload:ids,
      callback:(data)=>{
        console.log(data)
        if(data.success){
          message.success(data.data)
          this.setState({selectedRowKeys:[]})
          this.getNoticeList();
        }
      }
    })
  }
  choosePerson = () => {
    this.setState({ diyVisible: true });

  }

  changeNoticeType = e => {
    this.setState({
      noticeType: e.target.value,
    });
  }
  isMember = (value) => { // 过滤非成员账号
    let result = String(value).indexOf('member') > -1;
    return result;
  }

  onChangeforReceivers = value => {
    const checkedMidKeys = value.filter(item => this.isMember(item));
    let ids = [];
    checkedMidKeys.map((item, index) => {
      ids.push(parseInt(item.split("member")[1]))
    })
    this.setState({ members: JSON.stringify(ids) });
  }

  checkMembers = values => {
    console.log(values, '选中的人员ID是：');
  }

  formatterForMembers = (data, inGroup = true) => {
    const newData = data && data.map(item => {
      let { parentId, id, name, children, members } = item;

      let newMembers;
      if (members) {
        newMembers = members.map(ii => { return { ...ii, parentId: id, member: true } });
      }
      let key = id;
      if (item.member) { // 成员标识
        key = `member${id}`;
      }

      children = members ? newMembers.concat(children ? children : []) : children;

      return {
        parent: parentId,
        id,
        title: name,
        key,
        value: key,
        children: this.formatterForMembers(children, inGroup = true),
      }
    })
    return newData;
  }

  openReadorUnreadList = (record) => {
    const {dispatch} = this.props;
    dispatch({
      type:'notice/noticeLookInfo',
      payload: {
        id:String(record.id)
      },
      callback:(res)=>{
        console.log('查询公告未确认和确认人数:',res)
      }
    })
    this.setState({ readVisible: true });
  }

  closeReadModal = () => {
    this.setState({ readVisible: false });
  }


  notificationTs=(key,info)=>{
    message.error(info);
  }
  cancelPublish = () => {
    this.setState({ visible: false });
  }

  submitPublishFailed = () => {

  }

  sendBulletins = () => {
    this.setState({ diyVisible: false });
  }

  cancelSend = () => {
    this.setState({ diyVisible: false });
  }

  handleScreen = values => {
    console.log('查询条件是：', values);
  }
  handleChangeDate = (value)=>{
    let startTime = null,
      endTime = null;
    if (value && value.length == 2) {
      startTime =value[0].format("YYYY-MM-DD")+' 00:00:00',
        endTime = value[1].format("YYYY-MM-DD")+' 23:55:55';
    }
    let params = Object.assign({}, this.state.params, { endTime, startTime });
    if (!endTime || !startTime) {
      params = omit(params, ['endTime', 'startTime']);
    }
    this.setState({ params }, () => {
      this.getNoticeList();
    })
  }
  handleChangeStatus= (value)=>{
    let params = Object.assign({}, this.state.params, { status: Number(value)});
    this.setState({ params }, () => {
      this.getNoticeList();
    })
  }
  handleReset = () => {
    console.log('aaaaaaaaaaa')
    let params = omit(this.state.params, ['content', 'status', 'endTime', 'startTime']);
    this.setState({ params }, () => {
      this.getNoticeList();
    })
  }
  handleSearch = value => {
    let params = Object.assign({}, this.state.params, { searchContent: value.trim()});
    this.setState({ params }, () => {
      this.getNoticeList();
    })
  }
  disabledDates = (current)=> {
    return current && current < moment().endOf('day').add(-1,'days');
  }
  closeModal = (flag) => {
    this.setState({ 'xqvisible': flag });
  }

  columns = (page) => {
    let columns = [{
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 100,
      render: (_, __, i) => (page-1)*10 + i + 1
    },
    {
      title: '发布人',
      dataIndex: 'creatorId',
      key: 'creatorId',
      align: 'center',
      width: 150,
    },
    {
      title: '标题公告',
      dataIndex: 'noticeTitle',
      key: 'noticeTitle',
      align: 'center',
      width: 400,
      render: (text, record) => <Button type="link" onClick={() => this.lookBulletins(record.id)} className={styles.button}>{text}</Button>
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 200,
      render: time => <span>{timestampToTime(time)}</span>
    },
    {
      title: '未确认人数',
      dataIndex: 'confirmNum',
      key: 'confirmNum',
      align: 'center',
      width: 130,
      render: (text, record) => <Button type="link" onClick={() => this.openReadorUnreadList(record)}>{text}人</Button>
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 150,
      render: text => <span className={`${text == 3 ? styles.success : text == 2 ? styles.danger : text == 0 ? styles.delete : styles.normal }`}>{stateObj[text]}</span>
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: 200,
      render: (_, record) =>  {
        const cannotDeleteAction = record.status == '2' || record.status == '3';
        const cannotEditAction =  record.status != '0';
        return (
        <>
          {/* <Button type="link" onClick={() => this.lookBulletins(record.id)} style={{ marginRight: '5px' }}>查看</Button> */}
          <Button type="link" onClick={() => this.editBulletins(record)} style={{ marginRight: '5px' }} disabled={cannotEditAction}>编辑</Button>
          <Popconfirm
            title="您确定删除该公告吗？"
            onConfirm={() => this.deleteBulletins(record.id)}
            onCancel={() => null}
          >
            <Button type="link" danger disabled={cannotDeleteAction}>删除</Button>
          </Popconfirm>
        </>
        )

      }
    }];

    return columns;
  }

  render() {
    const { visible, dVisible,isValue, diyVisible, readVisible, noticeType, members, edit, currentBulletins,errInfo,noticeInfo,selectedRowKeys,xqVisible } = this.state;
    const noticeStatus = currentBulletins.status
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.status === 2 || record.status === 3, // Column configuration not to be checked
        name: record.name,
      })
    };
    let {
      enterprise: { dpMembers },
      loading,
    } = this.props;
    dpMembers =dpMembers && dpMembers.data;
    console.log('dpMembers',dpMembers, this.formatterForMembers(dpMembers))
    const hasChoose = selectedRowKeys.length > 0;
    const {noticeList} = this.props.notice && this.props.notice;
    const { confirmData } = this.props.notice && this.props.notice;
    const userNamesRead = confirmData.userNamesRead && confirmData.userNamesRead
    const userNamesUnRead = confirmData.userNamesUnRead && confirmData.userNamesUnRead
    console.log(userNamesUnRead,'userNamesUnRead')
    console.log(userNamesRead,'userNamesRead')
    let dataSource = {};
    const tProps = {
      value: members,
      placeholder: '选择接收人员',
      treeData: this.formatterForMembers(dpMembers),
      onChange: this.onChangeforReceivers,
      treeCheckable: true,
      onSelect: this.onSelectforReceivers,
      // showCheckedStrategy: SHOW_PARENT,
    };


    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>公告管理</Typography.Title>
        <Row>
            <Col span={4}>
                <Button type="primary" onClick={this.addBulletins} ghost style={{ margin: '30px 0 20px' }}>添加公告</Button>
            </Col>
            <Col span={20}>
                <SearchFormBulletinsManage
                  handleChangeDate = {this.handleChangeDate}
                  handleChangeStatus ={this.handleChangeStatus}
                  handleReset={this.handleReset}
                  handleSearch={this.handleSearch} handleScreen={this.handleScreen} />
            </Col>
        </Row>
        <Table
          dataSource={noticeList.list}
          columns={this.columns(noticeList && Number(noticeList.pageNum) || 1)}
          rowSelection={rowSelection}
          loading={loading}
          pagination = {{
            size: 'small',
            pageSize: noticeList && Number(noticeList.pageSize) || 10,
            total: noticeList && Number(noticeList.total) || 0,
            current: noticeList && Number(noticeList.pageNum) || 1,
            // showQuickJumper: true,
            onChange: this.handlePageChange,
          }}
          rowKey="id"
          scroll={{ x: 1400 }}
        />
        <Button type="primary" disabled={!hasChoose} danger onClick={() => this.batchDel(selectedRowKeys)} >删除</Button>
        <Modal
          visible={visible}
          title='编辑公告'
          destroyOnClose={true}
          maskClosable={true}
          width="780px"
          footer={null}
          onCancel={() => this.setState({visible:false,isValue:false})}
          onOk={() => this.setState({visible:false,isValue:false})}
        >
          <Form
            // className={styles.form}
            labelCol={{span: 6}}
            wrapperCol={{span: 14}}
            layout="horizontal"
            onFinish={(v)=>this.submitPublish(v,{currentBulletins})}
            onFinishFailed={this.submitPublishFailed}
            initialValues={isValue ? currentBulletins : ''}
          >
            <Form.Item label="公告标题：" name="noticeTitle">
              <Input name="noticeTitle" disabled={!edit} maxLength={30} />
            </Form.Item>
            <Form.Item label="公告内容：" name="content">
              <TextArea rows={6} name="content" disabled={!edit} maxLength={500} />
            </Form.Item>
            <Form.Item label="显示时间："  name='publishTime'>
              <RangePicker name="publishTime" style={{ width: '427px' }} format={'YYYY-MM-DD HH:mm'} disabled={!edit} disabledDate={this.disabledDates} />
            </Form.Item>
            <Form.Item label="通知成员：" name='members'>
              <Radio.Group onChange={this.changeNoticeType} value={noticeType} disabled={!edit}>
                <Radio value={0}> 企业所有人 </Radio>
                <Radio value={1} onClick={this.choosePerson}> 自定义 </Radio>
              </Radio.Group>
            </Form.Item>
            <div className={styles.btns} hidden={!edit}>
              <Button type="primary" htmlType="submit" style={{ marginRight: '35px' }}>确定发布</Button>
              <Button onClick={this.cancelPublish}>取消</Button>
            </div>
          </Form>
        </Modal>

        <Modal
          visible={diyVisible}
          title='请选择公告接收人'
          onOk={this.sendBulletins}
          onCancel={this.cancelSend}
        >
          <Tabs defaultActiveKey="1" type="card">
            <TabPane tab="企业成员" key="1">
              <TreeSelect { ...tProps } style={{ width: '100%' }}/>

            </TabPane>
          </Tabs>
        </Modal>

        <Modal
          visible={readVisible}
          title=''
          onCancel={this.closeReadModal}
          footer={null}
        >
          <Tabs defaultActiveKey="3" type="card">
            <TabPane tab="未确认" key="3">
              <List
                itemLayout="horizontal"
                dataSource={userNamesRead}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={`${devAuth}/epauth/api/account/avatar?userId=${item.id}`}/>}
                      title={item.name}
                      description={null}
                    />
                  </List.Item>
                )}
              />
            </TabPane>
            <TabPane tab="已确认" key="4">
              <List
                itemLayout="horizontal"
                dataSource={userNamesUnRead}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={`${devAuth}/epauth/api/account/avatar?userId=${item.id}`}/>}
                      title={item.name}
                      description={null}
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        </Modal>


        <Modal
          title={`查看公告`}
          visible={xqVisible}
          destroyOnClose={true}
          onCancel={() => this.setState({xqVisible:false})}
          onOk={() => this.setState({xqVisible:false})}
          footer={
            <Button onClick={() => this.setState({xqVisible:false})}>确定</Button>
          }
        >
          {/* 公告标题 公告内容 发布时间 */}
          <ul className={styles.list}>
            <li><span className={styles.title}>公告标题：</span><span className={styles.content}>{noticeInfo.noticeTitle}</span></li>
            <li><span className={styles.title}>公告内容：</span><span className={styles.content}>{noticeInfo.content}</span></li>
            <li><span className={styles.title}>发布时间：</span><span className={styles.content}>{timestampToTime(noticeInfo.createTime)}</span></li>
            <li><span className={styles.title}>发布人：</span><span className={styles.content}>{noticeInfo.creatorId}</span></li>
          </ul>
        </Modal>
      </PageHeaderWrapper>
    )
  }
}
export default  BulletinsManage;
// export default connect(({ notice}) => ({
//   notice
// }))(BulletinsManage);

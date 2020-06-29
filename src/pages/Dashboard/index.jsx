import React from 'react';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Row, Col, Progress, Spin } from 'antd';
import Pie from '@/components/Charts/Pie';
import Bar from '@/components/Charts/Bar';
import { Link } from 'umi';
import { timestampToTime, unitConversion, attributeCount } from '@/utils/utils';
import NetHandler from '@/utils/pomelo/netHandler';
import defaultSettings from '../../../config/defaultSettings';
import PomeloClient from "@/utils/pomelo/pomeloClient";
import { RESULT_STATUS } from '@/const/STATUS';
import enterprise from '@/data/enterprise';
import styles from './index.less';

//sources
import logo from '@/assets/logo.png';
import teamIcon from '@/assets/teamIcon.png';
import files from '@/assets/files.png';
import department from '@/assets/department.png';
import team from '@/assets/team.png';
import share from '@/assets/share.png';

const { auth, yocloud, sourceUrl, devAuth } = defaultSettings;

@connect(({ global, enterprise, packet, loading }) => ({
  global,
  enterprise,
  packet,
  membersNumResult: enterprise.membersNumResult,
  pieLoading: loading.effects['enterprise/fetchMemNum'],
}))

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filesData: [],

      //enterprise
      totalSpace: {}, // 总空间
      departmentSpace: { name: '部门文档空间' },  // 部门空间
      teamSpace: { name: '群组文档空间' },  // 群组空间信息
    }
  }

  handleSubmit = e => {

  }

  async componentDidMount() {
    await this.getCurrentEnterpriseInfo();  // 企业空间配置
    await this.queryDepartments();  // 部门组织架构
    this.getPacketSpaceUsed();  // 群组空间用量 
    this.getPacketTotal();

    await this.getDocumentInfo(); //获取文档数
  }

  getCurrentEnterpriseInfo = async () => {  // 当前企业信息
    let currentEpInfoResult = await NetHandler.getCurrentEnterpriseInfo();
    if (this.noresult(currentEpInfoResult)) return;
    const { enterprise } = currentEpInfoResult;
    const { upgradeCapacity, basicCapacity, usedSpace } = enterprise;
    this.setState({
      totalSpace: { total: upgradeCapacity + basicCapacity, name: '总空间', used: usedSpace },
    });
  }

  queryDepartments = () => { // 组织架构
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchDepartments',
      callback: res => {
        if (res && res.code === RESULT_STATUS.SUCCESS) {
          let { data } = res;
          let parentId = data[0].id;
          this.getCurrentDepartment(parentId);
          this.statisticMembers(parentId);
        }
      }
    })
  }

  statisticMembers = (departmentId) => {  // 统计人数
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchMemNum',
      payload: {
        departmentId
      }
    })
  }

  getCurrentDepartment = async (departmentId) => { // 部门信息
    let departmentLarge = await NetHandler.getDepartmentDetailInfo({ departmentId }); // 部门信息（公司最大部门）
    if (this.noresult(departmentLarge)) return;

    const { curDepartment: { spaceLimit, usedSpace, memberCount, epSpaceLimit }, } = departmentLarge;
    this.setState({
      departmentSpace: { name: '部门文档空间', used: usedSpace, total: epSpaceLimit },
      totalMembersCount: memberCount,
    });
  }

  getPacketSpaceUsed = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'packet/fetchSpaceUsed',
      callback: res => {
        if (res && res.code === RESULT_STATUS.SUCCESS) {
          this.setState({ teamSpace: { name: '群组文档空间', total: undefined, used: res.data } });
        }
      }
    })
  }

  getPacketTotal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'packet/fetchTotal'
    })
  }

  getDocumentInfo = async () => {
    let res = await NetHandler.getDocumentInfo();
    if (this.noresult(res)) return;
    let { info: { allFilesCount, departmentFilesCount, packetFilesCount, shareFilesCount } } = res;

    this.setState({
      filesData: [
        { total: allFilesCount, name: '文档总数', icon: files },
        { total: departmentFilesCount, name: '部门文档', icon: department },
        { total: packetFilesCount, name: '群组文档', icon: team },
        { total: shareFilesCount, name: '共享文档', icon: share },
      ]
    });
  }

  noresult = (result) => {
    if (!result || result.resultCode !== RESULT_STATUS.SUCCESS) return true;
  }

  render() {
    const {
      filesData,
      totalSpace,
      departmentSpace,
      teamSpace,
      departmentsLarge,
    } = this.state;

    const {
      currentUser = {
        avatar: '',
        name: '',
      },
      global,
      packet: { spaceResult, packetTotal },
      membersNumResult,
      pieLoading,
    } = this.props;

    let membersNum = membersNumResult && membersNumResult.data;
    let departmentsList = membersNum && membersNum.items || [];  // 人数分布
    let totalMembersCount = membersNum && membersNum.totalUniq;  // 总人数

    let workType = {};
    departmentsList.map(item => workType[item.name] = Number(item.count));

    let filesInfo = {};
    filesData.map(item => filesInfo[item.name] = Number(item.total));

    const { epInfo } = global;
    const { epInfo: { data: epData } } = global;
    
    return (
      <div className={styles.grid}>
        <Row>
          <Col span={8}>
            <div className={styles.content}>
              <div className={`${styles.top} ${styles.module}`}>
                <div className={styles.logo}>
                  <img src={devAuth + epInfo && epInfo.logo} style={{ height: '80px' }} />
                  <span>{epData && epData.name}</span>
                </div>
                <h4 className={styles.title}>企业信息</h4>
                <div className={styles.info}>
                  <ul className={styles.listul}>
                    <li>
                      <span className={styles.label}>企业名称</span>
                      <span className={`${styles.wrapper} ${styles.name}`}>{epData && epData.name}</span>
                      <span className={styles.allName}>{epData && epData.name}</span>
                    </li>
                    <li>
                      <span className={styles.label}>企业ID</span>
                      <span className={styles.wrapper}>{epData && epData.udid}</span>
                    </li>
                    <li>
                      <span className={styles.label}>企业简称</span>
                      <span className={`${styles.wrapper} ${styles.name}`}>{epData && epData.abbrev}</span>
                      <span className={styles.allName}>{epData && epData.abbrev}</span>
                    </li>
                    <li>
                      <span className={styles.label}>有效期</span>
                      <span className={styles.wrapper}>{epData && timestampToTime(epData.expireTime)}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={`${styles.bottom} ${styles.module}`}>
                <h4 className={styles.title}>空间数据</h4>
                <div className={styles.info}>
                  <ul className={styles.list}>
                    {/* 总空间 */}
                    <li key={0}>
                      <span>{totalSpace.name}</span>
                      <Progress percent={(totalSpace.used / totalSpace.total).toFixed(4) * 100} />
                      <span className={styles.spaceInfo}>
                        <span>已使用 {unitConversion(totalSpace.used)}</span>
                        <span>总量 {unitConversion(totalSpace.total)}</span>
                      </span>
                    </li>
                    {/* 部门文档 */}
                    <li key={1}>
                      <span>{departmentSpace.name}</span>
                      {/* <Progress percent={(departmentSpace.used / departmentSpace.total).toFixed(4) * 100} /> */}
                      <span className={styles.spaceInfo}>
                        <span>已使用 {unitConversion(departmentSpace.used)}</span>
                        {/* <span>总量 {unitConversion(departmentSpace.total)}</span> */}
                      </span>
                    </li>
                    {/* 群组文档 */}
                    <li key={2}>
                      <span>{teamSpace.name}</span>
                      {/* <Progress percent={(teamSpace.used / teamSpace.total).toFixed(4) * 100} /> */}
                      <span className={styles.spaceInfo}>
                        <span>已使用 {unitConversion(teamSpace.used)}</span>
                        {/* <span>总量 {unitConversion(teamSpace.total)}</span> */}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Col>
          <Col span={16}>
            <div className={styles.content}>
              <div className={`${styles.top} ${styles.module}`}>
                <h4 className={styles.title}>用户数据</h4>
                <div className={styles.info}>
                  <div className={styles.total}>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', display: 'block' }}>{totalMembersCount}</span>
                    <span>总用户数</span>
                  </div>
                  <Spin spinning={pieLoading} spinning={false}>
                    <Pie data={workType} theme={'light'} height={200} />
                  </Spin>
                </div>
              </div>
              <div className={`${styles.middle} ${styles.module}`}>
                <h4 className={styles.title}>文档数据</h4>
                <div className={styles.info}>
                  <Row>
                    <Col span={7}>
                      <div className={styles.filesList}>
                        {
                          filesData.map((item, index) => {
                            return (
                              <div className={styles.filesItem} key={index}>
                                <img src={item.icon} />
                                <span>{item.name}：</span>
                                <span>{item.total}</span>
                              </div>
                            )
                          })
                        }
                      </div>
                    </Col>
                    <Col span={17} style={{ marginTop: '-50px' }} >
                      <Spin spinning={pieLoading} spinning={false}>
                        <Bar
                          data={filesInfo}
                          theme={'light'}
                          start={attributeCount(filesInfo) < 8 ? 0 : 54}
                          height={300}
                        />
                      </Spin>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className={`${styles.bottom} ${styles.module}`}>
                <h4 className={styles.title}>其他数据</h4>
                <div className={styles.info}>
                  <div className={styles.item}>
                    <span className={styles.icon}><img src={teamIcon} /></span>
                    <span className={styles.desp}>群组数量：</span>
                    <span className={styles.num}>{packetTotal && packetTotal.data}</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Dashboard;


import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { UserOutlined } from '@ant-design/icons';
import { Typography, Table, Popconfirm, Button, Popover, Radio, Modal, message } from 'antd';
import SearchFormManage from './searchForm';
import { omit } from 'lodash';
import { connect } from 'dva';
import { timestampToTime, timestampToTime2 } from '@/utils/utils';

import styles from './index.less';

import { RESULT_STATUS } from '@/const/STATUS';

const stateObj = {
  '0': '正常',
  '1': '已解散',
  '2': '永久删除',
}

@connect(({ packet, loading }) => ({
  packet,
  packetsResult: packet.packetsResult,
  packetMembers: packet.packetMembers,
  transferResult: packet.transferResult,
  loading: loading.effects['packet/fetch'],
}))
class TeamManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      transferParams: {}, // 移交参数
      visible: false,
      params: { // 筛选条件
        pageSize: 10,
        currentPage: 1,
      },
      currentMember: {},  //当前移交对象
    }
  }

  componentDidMount() {
    this.getPacketList();
  }

  getPacketList = (otherParams = {}) => {
    const { dispatch } = this.props;
    const { params } = this.state;
    dispatch({
      type: 'packet/fetch',
      payload: {
        ...params,
        ...otherParams,
      }
    })
  }

  queryPacketMembers = (packetId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'packet/fetchMembers',
      payload: {
        packetId
      },
    })
  }

  handlePageChange = (currentPage, pageSize) => {
    let params = Object.assign({}, this.state.params, { pageSize, currentPage });
    this.setState({ params }, () => {
      this.getPacketList();
    })
  }

  handleSearch = value => {
    console.log('查询条件是：', value);
    let params = Object.assign({}, this.state.params, { name: value.trim() });
    this.setState({ params }, () => {
      this.getPacketList();
    })
  }

  handleSelect = value => {
    let params = Object.assign({}, this.state.params, { status: Number(value) });
    this.setState({ params }, () => {
      this.getPacketList();
    })
  }

  handleReset = () => {
    let params = omit(this.state.params, ['name', 'status', 'endTime', 'startTime']);
    this.setState({ params }, () => {
      this.getPacketList();
    })
  }

  handleChangeDate = (value) => {
    let startTime = null,
      endTime = null;
    if (value && value.length == 2) {
      startTime = new Date(value[0]).getTime(),
        endTime = new Date(value[1]).getTime();
      startTime = timestampToTime2(startTime),
        endTime = timestampToTime2(endTime);
    }
    let params = Object.assign({}, this.state.params, { endTime, startTime });
    if (!endTime || !startTime) {
      params = omit(params, ['endTime', 'startTime']);
    }

    this.setState({ params }, () => {
      this.getPacketList();
    })
  }

  openTransfer = (packetId, ownerId) => {
    this.queryPacketMembers(packetId);
    let transferParams = Object.assign({}, this.state.transferParams, { packetId, ownerId });
    this.setState({
      transferParams
    }, () => {
      this.setState({
        visible: true,
      })
    });
  }

  onChangeTransfer = e => {
    let transferParams = Object.assign({}, this.state.transferParams, { targetUserId: e.target.value });
    let { packetMembers } = this.props;
    packetMembers = packetMembers && packetMembers.data;
    let currentMember = packetMembers.filter(i => i.userId == e.target.value)[0];
    this.setState({
      transferParams,
      currentMember,
    });
  }

  transferPacket = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'packet/transfer',
      payload: params,
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('移交成功');
          this.getPacketList();
        }
      }
    })
  }

  handleTransfer = () => {
    let { transferParams, currentMember } = this.state;
    if (JSON.stringify(currentMember) == '{}') {
      message.error('目标群组群主和原来群主保持一致');
      return;
    }
    transferParams = omit(transferParams, 'ownerId');
    this.transferPacket(transferParams);
    this.handleCancelTransfer();
  }

  handleCancelTransfer = () => {
    this.setState({ visible: false });
  }

  getMembers = teamId => {
    // 请求团队成员接口 获取成员数据
    // dispatch ...
    this.queryPacketMembers(teamId);
  }

  columns = (page) => {
    let columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 100,
      render: (_, __, i) => (page - 1) * 10 + i + 1
    },
    {
      title: '群组名',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 250,
      render: (text, record) => {
        let { packetMembers } = this.props;
        packetMembers = packetMembers && packetMembers.data || [];
        const content = packetMembers.map(item => {
          return (
            <div key={item.userId} className={styles.item}>
              <span className={styles.icon}>
                {item.roleId == "1" && <UserOutlined key={item.roleId} />}
              </span>
              <span>{item.userName}</span>
            </div>
          )
        }
        );
        return (
          <Popover
            placement="right"
            title="群组成员"
            content={content}
            trigger="click"
          >
            <Button type="link" onClick={() => this.getMembers(record.id)}>{text}</Button>
          </Popover>
        )
      }
    },
    {
      title: '所有者',
      dataIndex: 'owner',
      key: 'owner',
      align: 'center',
      width: 200,
      render: text => {
        //待。。。待续
        let { packetsResult } = this.props;
        let names = packetsResult && packetsResult.data && packetsResult.data.names || {};
        return <Button type="link">{names[text]}</Button>
      }
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 200,
      render: time => <span>{timestampToTime(time)}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: status => <span className={`${status == 1 || status == 2 ? styles.delete : styles.normal}`}>{stateObj[status]}</span>
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_, record) => <Button type="link" disabled={record.status != '0'} onClick={() => this.openTransfer(record.id, record.owner)}>移交</Button>
    }
  ];
  return columns;
}

  render() {
    const { selectedRowKeys, transferParams, visible, currentMember } = this.state;
    let { packetsResult, transferResult, packetMembers, loading } = this.props;
    let packetList = packetsResult && packetsResult.data && packetsResult.data.pageInfo || {};
    packetMembers = packetMembers && packetMembers.data || [];

    const hasChoose = selectedRowKeys.length > 0;

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>群组管理</Typography.Title>
        <SearchFormManage
          handleSearch={this.handleSearch}
          handleSelect={this.handleSelect}
          handleReset={this.handleReset}
          handleChangeDate={this.handleChangeDate}
        />
        <Table
          columns={this.columns(Number(packetList && packetList.pageNum) || 1)}
          dataSource={packetList && packetList.list}
          scroll={{ x: 1000 }}
          pagination={{
            size: 'small',
            pageSize: Number(packetList && packetList.pageSize),
            total: Number(packetList && packetList.total),
            current: Number(packetList && packetList.pageNum),
            // showQuickJumper: true,
            onChange: this.handlePageChange,
          }}
          loading={loading}
          rowKey="id"
        />
        <Modal
          title="群组成员"
          visible={visible}
          // onOk={this.handleTransfer}
          footer={false}
          onCancel={this.handleCancelTransfer}
        >
          <div className={styles.modal}>
            <Radio.Group defaultValue={transferParams.ownerId} onChange={this.onChangeTransfer}>
              {
                packetMembers && packetMembers.map(item => {
                  return (
                    <Radio
                      style={{ display: 'inline-block' }}
                      value={item.userId}
                      style={radioStyle}
                      key={item.userId}
                    >
                      <span className={styles.icon}>
                        {/* 管理员 */}
                        {item.roleId == "1" && <UserOutlined />}
                      </span>
                      {item.userName}
                    </Radio>
                  )
                })
              }
            </Radio.Group>
          </div>
          <div className={styles.btns}>
            {
              JSON.stringify(currentMember) == '{}'
                ? <Button type="primary" style={{ marginRight: '10px' }} onClick={this.handleTransfer}>确定</Button>
                : <Popconfirm
                  title={`您确定将群主移交给${currentMember.userName}`}
                  onConfirm={this.handleTransfer}
                >
                  <Button type="primary" style={{ marginRight: '10px' }}>确定</Button>
                </Popconfirm>
            }
            <Button type="primary" ghost onClick={this.handleCancelTransfer}>取消</Button>
          </div>
        </Modal>
      </PageHeaderWrapper>
    )
  }
}

export default TeamManage;

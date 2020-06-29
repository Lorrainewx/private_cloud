import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Table, Button, Form, DatePicker, Input, Radio, Tabs, Popconfirm, List, Avatar, message, Modal } from 'antd';
import SearchFormBulletins from './searchForm';
import { connect } from 'dva';
import { omit } from 'lodash';
import { RESULT_STATUS } from '@/const/STATUS'
import { timestampToTime, timestampToTime2 } from '@/utils/utils';
import styles from './index.less';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

@connect(({ packet, loading }) => ({
  packet,
  noticesResult: packet.noticesResult,
  deleteResult: packet.deleteResult,
  loading: loading.effects['packet/fetchNotices'],
}))
class Bulletins extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {
        currentPage: 1,
        pageSize: 10,
      },
      selectedRowKeys: [],
      visible: false,
      currentInfo: {},  //当前公告信息
    }
  }

  componentDidMount() {
    this.queryNotices();
  }

  queryNotices = () => {
    const { dispatch } = this.props;
    const { params } = this.state;
    dispatch({
      type: 'packet/fetchNotices',
      payload: params,
    })
  }

  openModal = (flag = true, record = {}) => {
    if (JSON.stringify(record) == '{}') {
      this.setState({ visible: flag });
      return;
    }
    this.setState({
      currentInfo: record
    }, () => {
      this.setState({ visible: flag });
    });
  }

  handlePageChange = (pageNum, pageSize) => {
    let params = Object.assign({}, this.state.params, { currentPage: pageNum });
    this.setState({ params }, () => {
      this.queryNotices();
    });
  }

  deleteBulletins = ids => {
    // 提交删除 接口
    const { dispatch } = this.props;
    dispatch({
      type: 'packet/delete',
      payload: {
        ids: String(ids)
      },
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          message.success('删除成功');
          this.queryNotices();
          this.setState({ selectedRowKeys: [] }); //清除
        }
      }
    })
  }

  handleSearch = value => {
    let params = Object.assign({}, this.state.params, { name: value.trim() });
    this.setState({ params }, () => {
      this.queryNotices();
    })
  }

  onSelectChange = selectedRowKeys => {
    console.log('已选择列 ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

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
      this.queryNotices();
    })
  }

  handleReset = () => {
    let params = omit(this.state.params, ['name', 'endTime', 'startTime']);
    this.setState({ params }, () => {
      this.queryNotices();
    })
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
      title: '标题公告',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
      width: 400,
      render: (text, record) => <Button type="link" onClick={() => this.openModal(true, record)} className={styles.button}>{text}</Button>
    },
    {
      title: '所属群组',
      dataIndex: 'packetName',
      key: 'packetName',
      align: 'center',
      width: 200,
    },
    {
      title: '发布人',
      dataIndex: 'userName',
      key: 'userName',
      align: 'center',
      width: 150,
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
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        return (
          <Popconfirm
            title="您确定要删除该公告吗？"
            onConfirm={() => this.deleteBulletins(record.id)}
            onCancel={() => null}
          >
            <Button type="link" danger >删除</Button>
          </Popconfirm>
        )
      }
    }
  ]
  return columns;
  };

  render() {
    const { selectedRowKeys, visible, currentInfo } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const hasChoose = selectedRowKeys.length > 0;

    const { noticesResult, loading } = this.props;
    let dataSource = noticesResult && noticesResult.data || {};

    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>群组公告</Typography.Title>
        <SearchFormBulletins
          handleSearch={this.handleSearch}
          handleChangeDate={this.handleChangeDate}
          handleReset={this.handleReset}
        />
        <Table
          dataSource={dataSource && dataSource.packetPost}
          columns={this.columns(dataSource && Number(dataSource.currentPage) || 1)}
          rowSelection={rowSelection}
          pagination={{
            size: 'small',
            pageSize: dataSource && Number(dataSource.pageSize),
            total: dataSource && Number(dataSource.total),
            current: dataSource && Number(dataSource.currentPage),
            // showQuickJumper: true,
            onChange: this.handlePageChange,
          }}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
        />
        <Button type="primary" disabled={!hasChoose} danger onClick={() => this.deleteBulletins(selectedRowKeys)} >删除</Button>

        <Modal
          title={`查看公告`}
          visible={visible}
          destroyOnClose={true}
          onCancel={() => this.openModal(false)}
          onOk={() => this.openModal(false)}
        >
          {/* 公告标题 公告内容 发布时间 */}
          <ul className={styles.list}>
            <li><span className={styles.title}>公告标题：</span><span className={styles.content}>{currentInfo.title}</span></li>
            <li><span className={styles.title}>公告内容：</span><span className={styles.content}>{currentInfo.content}</span></li>
            <li><span className={styles.title}>发布时间：</span><span className={styles.content}>{timestampToTime(currentInfo.publishTime)}</span></li>
            <li><span className={styles.title}>发布人：</span><span className={styles.content}>{currentInfo.userName}</span></li>
          </ul>
        </Modal>
      </PageHeaderWrapper>
    )
  }
}

export default Bulletins;

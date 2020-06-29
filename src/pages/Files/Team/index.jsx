import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Table, Button, Popconfirm, message, Breadcrumb } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import { omit } from 'lodash';
import SearchFormTeam from './searchForm';
import { timestampToTime, unitConversion, generateUuid, getCookie, Base64_decode } from '@/utils/utils';
import { getFileId } from '@/utils/cloud';
import FileTypeIconMap from '@/utils/files/filesIconMap';
import YZFile from '@/utils/files/fileInfo';
import NetHandler from '@/utils/pomelo/netHandler';
import { RESULT_STATUS } from '@/const/STATUS';

import styles from './index.less';

import FILE_TYPE from '@/const/FILE_TYPE';
const stateObj = {
  '1': '已删除',
  '0': '正常',
  '2': '已回收',
}
@connect(({ packet, file, user }) => ({
  packet,
  file,
  currentUser: user.currentUser,
}))
class TeamFiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      params: {         // 群组列表参数 
        currentPage: 1,
        pageSize: 1000,
      },
      currentPacketId: undefined, //当前群组ID
      paramsforFiles: {
        type: FILE_TYPE.ALL,
        page: 0,
        pageSize: 10,
      },
      packetFiles: {},  //群组文件列表 
      // 搜索接口参数
      options: {},
      paramsforSearch: { // 筛选列表参数
        page: 0,
        pageSize: 10,
      },
      searchFiles: {},  //搜索文件的值
      loading: false,
      searchStatus: false,  //查询状态

      navigateArray: [],  //路径数组
      previewUrl: null, // 预览参数
      navigateHidden: true,
      pathList: [], //路径list
    }
  }

  componentDidMount() {
    this.queryPackets();  // 群组列表
    const { location: { search } } = this.props;
    if (!!!search) {
      let { paramsforFiles } = this.state;
      this.setState({
        pathList: [],
        paramsforFiles,
      });
      localStorage.removeItem('navigateInfo');
      return;
    }
    this.load(search);
  }

  componentDidUpdate(prevProps) {
    const { dispatch, location: { search } } = this.props;
    let { location: { search: prevSearch } } = prevProps;
    if (prevSearch == search) {
      return;
    }
    if (!!!search) {
      let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: this.state.currentPacketId });
      this.setState({
        pathList: [],
        paramsforFiles,
        pLoading: true,
      }, () => {
        this.queryPacketFiles();
      });
      localStorage.removeItem('navigateInfo');
      return;
    }
    this.load(search);
  }

  load = (search) => {
    let fileId = getFileId(search, 'fileId');
    let packetId = getFileId(search, 'packetId');

    if (!fileId) {
      // let { paramsforFiles, currentPacketId } = this.state;
      // console.log('currentPacketId, currentPacketId', currentPacketId);
      // let newparamsforFiles = Object({}, this.state.newparamsforFiles, { did: currentPacketId });
      // this.setState({
      //   paramsforFiles: newparamsforFiles
      // }, () => {
      //   this.queryPacketFiles();
      // })
      return;
    }
    // 请求getPacket
    let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: fileId });
    // 取路径
    let navigateObj = localStorage.getItem('navigateInfo') && JSON.parse(localStorage.getItem('navigateInfo')) || {};
    if (JSON.stringify(navigateObj) == "{}") {
      this.setState({ navigateHidden: true });  //隐藏导航
    }

    this.setState({
      pLoading: true,
      loading: true,
      paramsforFiles,
      currentPacketId: packetId,
      pathList: navigateObj && navigateObj.pathArr || [],
    }, () => {
      this.queryPacketFiles();
    })
  }

  componentWillUnmount() {
    console.log('即将要离开该页面');
  }

  queryPackets = () => {
    const { dispatch } = this.props;
    const { params } = this.state;
    dispatch({
      type: 'packet/fetch',
      payload: params,
    })
  }

  queryPacketFiles = async () => {
    let { paramsforFiles } = this.state;
    let res = await NetHandler.listDir({ ...paramsforFiles });
    if (this.noresult(res)) return;
    this.setState({ packetFiles: res, pLoading: false });
  }

  querySearchFiles = async () => {
    console.log('执行 querySearchFiles');
    let { options, paramsforSearch } = this.state;
    let res = await NetHandler.searchFileByName({
      options,
      ...paramsforSearch
    })
    if (this.noresult(res)) return;

    this.setState({ loading: false, searchFiles: res });
  }



  noresult = (result) => {
    if (!result || result.resultCode !== RESULT_STATUS.SUCCESS) return true;
  }

  deleteFile = async (file) => {
    let params = {
      deleteVersionIds: [],
      fidArr: typeof file == 'object' ? file : [file],
    }
    let res = await NetHandler.deleteByIds({ ...params });
    if (this.noresult(res)) return;
    message.success('删除成功');
    // 请求文件
    let { searchStatus } = this.state;

    searchStatus && this.querySearchFiles();
    !searchStatus && this.queryPacketFiles();
  }

  downloadFile = file => {
    console.log('您下载的文件是：', file);
    let { currentUser } = this.props;
    let userId = currentUser && currentUser.data && currentUser.data.userId;

    let SESSION_ID = getCookie('SESSION');
    let sid = "";
    if (SESSION_ID) { sid = Base64_decode(SESSION_ID) };

    let size = file.length;
    let params = {
      forEdit: false,
      userId,
      sessionId: sid,
    }
    params.fileIds = String(file);
    this.downloadFileOK(params);
  }

  downloadFileOK = (data) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'file/download',
      payload: { ...data },
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS && res.success) {
          window.location = res.data;
          message.success('下载成功');
        }
      }
    })
  }

  closeShare = async file => {
    let params = {
      fid: file.fileId
    }
    let res = await NetHandler.cancelShare({ ...params });
    if (this.noresult(res)) return;
    message.success('关闭成功');
    this.loadFileList();
  }

  closeEdit = async file => {
    let params = {
      fid: file.fileId
    }
    let res = await NetHandler.cancelShare({ ...params });
    if (this.noresult(res)) return;
    message.success('关闭成功');
    this.loadFileList();
  }

  loadFileList = () => {
    let { searchStatus } = this.state;
    switch (searchStatus) {  // 搜索状态      
      case true:
        this.querySearchFiles();
        break;
      case false:
        this.queryPacketFiles();
        break;
    }
  }

  onSelectChange = selectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  }

  handleSubmit = values => {
    let { currentPacketId } = this.state;
    let { status, createTime, queryString } = values;
    queryString = queryString ? queryString.trim() : "";
    status = status ? [status] : [0, 1, 2];

    let startTime = null,
      endTime = null;
    if (createTime && createTime.length == 2) {
      startTime = new Date(createTime[0]).getTime(),
        endTime = new Date(createTime[1]).getTime();
      startTime = timestampToTime(startTime),
        endTime = timestampToTime(endTime);
      startTime = startTime.split(" ")[0],
        endTime = endTime.split(" ")[0];
    }

    if (queryString == "" && startTime == null & endTime == null) {
      message.error('请选择筛选条件');
      return;
    }

    let options = Object.assign({}, this.state.options, { status, startTime, endTime });
    let paramsforSearch = Object.assign({}, this.state.paramsforSearch, { queryString, parentId: currentPacketId });
    this.setState({ options, paramsforSearch, searchStatus: true, loading: true, pathList: [] }, () => {
      localStorage.removeItem('navigateInfo');
      this.querySearchFiles();
    })
  }

  handleReset = () => {
    // 一切归零
    let { paramsforSearch, options, paramsforFiles } = this.state;
    paramsforFiles = Object.assign({}, this.state.paramsforFiles, { page: 0 });
    this.setState({
      paramsforSearch: { page: 0, pageSize: 10 },
      options: {},
      searchStatus: false,
      pLoading: true,
      loading: true,
      paramsforFiles,
    }, () => {
      this.queryPacketFiles();
    });
  }

  handleSelect = (value) => {
    console.log('请求群组列表文件', value);
    let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: value, page: 0 });//372390335489500
    this.setState({
      paramsforFiles,
      pLoading: true,
      currentPacketId: value,
      searchStatus: false,
    }, () => {
      // window.location.href = '/files/team';
      this.queryPacketFiles();  // 群组文件列表
    })
  }

  handlePageChange = (pageNumber, pageSize) => {  // 页码查询
    let { paramsforSearch, paramsforFiles, searchStatus } = this.state;
    if (searchStatus) {
      paramsforSearch = Object.assign({}, this.state.paramsforSearch, { page: pageNumber - 1 });
    } else {
      paramsforFiles = Object.assign({}, this.state.paramsforFiles, { page: pageNumber - 1 });
    }
    this.setState({ 
      paramsforSearch, 
      loading: true,
      paramsforFiles,
      pLoading: true,
    }, () => {
      searchStatus && this.querySearchFiles();
      !searchStatus && this.queryPacketFiles();
    });
  }

  openFiles = (fileInfo) => {
    let isFolder = fileInfo.isFolder();
    switch (isFolder) {
      case true:  //文件夹
        let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: fileInfo.fileId });
        // 从缓存中拿 // { pathArr: [] }
        let navigateInfo = localStorage.getItem('navigateInfo') ? localStorage.getItem('navigateInfo') : {};
        let navigateArray = JSON.stringify(navigateInfo) == "{}" ? [] : JSON.parse(navigateInfo).pathArr;
        let newnavigateArray = navigateArray.concat([fileInfo]);
        let obj = { pathArr: newnavigateArray };
        // 从缓存存
        localStorage.setItem('navigateInfo', JSON.stringify(obj));

        this.setState({
          paramsforFiles,
          pLoading: true,
          searchStatus: false,
        }, () => {
          this.queryPacketFiles();
        })
        break;
      case false: // 文件
        let params = {
          fileId: fileInfo.fileId,
          uuid: generateUuid(8, 62),
          version: 0,
          mobile: false,
        }
        this.getFilePreviewUrl({ ...params });
        break;
    }
  }

  showModal = (flag = true) => {
    this.setState({ previewVisible: flag });
  }

  getFilePreviewUrl = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'file/preview',
      payload: params,
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          let previewUrl = res.data.url;
          window.open(previewUrl, "_blank");
        }
      }
    })
  }

  backtofiles = (fileInfo) => {
    let { pathList: pathArr } = this.state;
    let newarr = [];
    let uuid = 20;
    for (let i in pathArr) {
      let file = pathArr[i];
      if (fileInfo.fileId == file.fileId) {
        uuid = i;
      }
      if (i <= uuid) {
        newarr.push(file);
      }
    }
    let newObj = { pathArr: newarr };
    localStorage.setItem('navigateInfo', JSON.stringify(newObj)); //去除一级
    this.setState({ pathList: newarr });

    // 请求接口
    let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: fileInfo.fileId });
    this.setState({
      paramsforFiles
    }, () => {
      this.queryPacketFiles();
    })
  }

  columns = [
    {
      title: '文档名',
      dataIndex: 'fileName',
      key: 'fileName',
      align: 'left',
      width: 240,
      render: (text, record) => {
        let fileInfo = YZFile(record);
        let iconPos = FileTypeIconMap.getIconPositionForFilInfo(fileInfo);
        return (
          <div onClick={() => this.openFiles(fileInfo)} style={{ cursor: 'pointer' }} className={styles.seemore}>
            {
              fileInfo.isFolder()
                ? <Link
                  to={`/files/team?fileId=${record.fileId}&packetId=${this.state.currentPacketId}`}
                  className={styles.fileName}
                  style={{ color: "rgba(0,0,0, .65)" }}
                >
                  <span
                    className={styles.fileNameIcon}
                    style={{ backgroundPositionX: iconPos.x, backgroundPositionY: iconPos.y }}
                  >
                  </span>
                  {text}
                </Link>
                : <span className={styles.fileName}>
                  <span
                    className={styles.fileNameIcon}
                    style={{ backgroundPositionX: iconPos.x, backgroundPositionY: iconPos.y }}
                  >
                  </span>
                  {text}
                </span>
            }
            {
              text.length > 10 &&
              <span className={styles.allwords}>
                <span
                  className={styles.fileNameIcon}
                  style={{ backgroundPositionX: iconPos.x, backgroundPositionY: iconPos.y }}
                >
                </span>
                {text}
              </span>
            }
          </div>
        )
      }
    },
    {
      title: '创建者',
      dataIndex: 'creatorName',
      key: 'creatorName',
      align: 'center',
      width: 150,
    },
    {
      title: '文件状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: state => <span className={`${styles[state]}`}>{stateObj[state]}</span>
    },
    {
      title: '更新时间',
      dataIndex: 'mtime',
      key: 'mtime',
      align: 'center',
      width: 180,
      render: (text, record) => <span>{text ? text : record.ctime}</span>
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      align: 'center',
      width: 100,
      render: size => <span>{unitConversion(size)}</span>
    },
    {
      title: '分享',
      key: 'share',
      align: 'center',
      width: 50,
      render: (_, record) => {
        let fileInfo = YZFile(record);
        return (
          <Popconfirm
            title="确定关闭分享吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.closeShare(record)}
            disabled={!(fileInfo.newShareAll == 1)}
          >
            <Button type="link" disabled={!(fileInfo.newShareAll == 1)}>关闭</Button>
          </Popconfirm>
        )
      }
    },
    {
      title: '协作',
      key: 'edit',
      align: 'center',
      width: 50,
      render: (_, record) => {
        let fileInfo = YZFile(record);
        return (
          <Popconfirm
            title="确定关闭协作吗？"
            okText="确定"
            cancelText="取消"
            disabled={!(fileInfo.isInviteSharing == 1)}
            onConfirm={() => this.closeEdit(record)}
          >
            <Button type="link" disabled={!(fileInfo.isInviteSharing == 1)}>关闭</Button>
          </Popconfirm>
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: 180,
      render: (_, record) => {
        return <>
          <Popconfirm
            title="确定删除文件吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.deleteFile(record.fileId)}
            disabled={record.status == '1'}
            onCancel={() => null}
          >
            <Button type="link" danger disabled={record.status == '1'}>删除</Button>
          </Popconfirm>
          <Button onClick={() => this.downloadFile(record.fileId)} type="link" disabled={record.state == 'delete'}>下载</Button>
        </>
      }
    }
  ]

  render() {
    let { selectedRowKeys, packetFiles, pLoading, searchFiles, loading, paramsforSearch, searchStatus, currentPacketId, previewUrl, previewVisible, pathList, paramsforFiles } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.status === '1', // Column configuration not to be checked
        name: record.status,
      }),
    };

    const hasChoose = selectedRowKeys.length > 0;

    let {
      packet: { packetsResult },
    } = this.props;
    packetsResult = packetsResult && packetsResult.data && packetsResult.data.pageInfo || {};
    let packets = packetsResult && packetsResult.list || [];

    console.log(pathList);

    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>群组文档管理</Typography.Title>
        {
          pathList.length > 0 &&
          <Breadcrumb style={{ marginTop: '20px' }}>
            {
              pathList.map(i => {
                return (
                  <Breadcrumb.Item
                    onClick={() => this.backtofiles(i)}
                    style={{ cursor: 'pointer' }}
                    key={i.fileId}
                  >
                    <Link to={`/files/team?fileId=${i.fileId}&packetId=${this.state.currentPacketId}`} >{i.fileName}</Link>
                  </Breadcrumb.Item>
                )
              })
            }
          </Breadcrumb>
        }
        <SearchFormTeam
          defaultValue={currentPacketId}
          packets={packets}
          handleSubmit={this.handleSubmit}
          handleReset={this.handleReset}
          handleSelect={this.handleSelect}
        />
        {
          !searchStatus &&
          <>
            <Table
              columns={this.columns}
              dataSource={packetFiles && packetFiles.resultSet && packetFiles.resultSet.fileInfos}
              scroll={{ x: 1400 }}
              rowSelection={rowSelection}
              loading={pLoading}
              pagination={{
                current: paramsforFiles.page + 1,
                total: packetFiles && Number(packetFiles.pages) * 10,
                pageSize: 10,
                onChange: this.handlePageChange
              }}
              rowKey="fileId"
            />
            <div className={styles.batchActions}>
              <Popconfirm
                title="确定批量删除文件吗？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.deleteFile(selectedRowKeys)}
                onCancel={() => null}
              >
                <Button type="primary" disabled={!hasChoose} danger>删除</Button>
              </Popconfirm>
              <Button type="primary" disabled={!hasChoose} style={{ marginLeft: '10px' }} onClick={() => this.downloadFile(selectedRowKeys)}>下载</Button>
            </div>
          </>
        }
        {
          searchStatus &&
          <>
            <Table
              columns={this.columns}
              dataSource={searchFiles && searchFiles.fileArr}
              scroll={{ x: 1400 }}
              rowSelection={rowSelection}
              loading={loading}
              pagination={{
                current: Number(paramsforSearch.page) + 1,
                total: searchFiles && Number(searchFiles.totalNumber),
                pageSize: 10,
                onChange: this.handlePageChange
              }}
              rowKey="fileId"
            />
            <div className={styles.batchActions}>
              <Popconfirm
                title="确定批量删除文件吗？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.deleteFile(selectedRowKeys)}
                onCancel={() => null}
              >
                <Button type="primary" disabled={!hasChoose} danger>删除</Button>
              </Popconfirm>
              <Button type="primary" disabled={!hasChoose} style={{ marginLeft: '10px' }}>下载</Button>
            </div>
          </>
        }
      </PageHeaderWrapper>
    )
  }
}

export default TeamFiles;
import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Table, Button, Popconfirm, Breadcrumb, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { connect } from 'dva';
import { Link } from 'umi';
import SearchFormShare from './searchForm';
import { timestampToTime, unitConversion, generateUuid, getCookie, Base64_decode } from '@/utils/utils';
import { getFileId } from '@/utils/cloud';
import FileTypeIconMap from '@/utils/files/filesIconMap';
import YZFile from '@/utils/files/fileInfo';
import NetHandler from '@/utils/pomelo/netHandler';
import FILE_TYPE from '@/const/FILE_TYPE';
import { RESULT_STATUS } from '@/const/STATUS';

import styles from './index.less';

import { values } from 'lodash';
const stateObj = {
  '1': '已删除',
  '0': '正常',
  '2': '已回收',
}

@connect(({ file, user }) => ({
  file,
  currentUser: user.currentUser,
}))
class ShareFiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      pathList: [], //路径列表
      loading: false,
      paramsforFiles: {
        type: FILE_TYPE.ALL,
        page: 0,
        pageSize: 10,
        // did: '8519145728510146',
      },
      searchStatus: false,  //是否为查询状态
      // 搜索接口参数
      options: {},
      paramsforSearch: { // 筛选列表参数
        page: 0,
        pageSize: 10,
      },
      sLoading: false,  //搜索加载中
      parentId: undefined, //企业folderId
    }
  }

  querySearchFiles = async () => {
    console.log('执行 querySearchFiles');
    let { options, paramsforSearch } = this.state;
    let res = await NetHandler.searchFileByName({
      options,
      ...paramsforSearch
    })
    if (this.noresult(res)) return;

    this.setState({ sLoading: false, searchFiles: res });
  }

  deleteFile = async file => {
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
    !searchStatus && this.queryFiles();
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

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  }

  handleSearch = values => {
    console.log('查询条件是：', values);
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
      sLoading: true, 
      pathList: [],
      paramsforFiles,
      loading: true,
    }, () => {
      searchStatus && this.querySearchFiles();
      // localStorage.removeItem('navigateInfoA');
      !searchStatus && this.queryFiles();
    });
  }

  async componentDidMount() {
    const { location: { search } } = this.props;
    this.load(search);
  }

  componentDidUpdate(prevProps) {
    const { dispatch, location: { search } } = this.props;
    let { location: { search: prevSearch } } = prevProps;
    if (prevSearch == search) {
      return;
    }
    this.load(search);
  }

  load = async (search,) => {
    // 群企业forderId 初始化
    let res = await NetHandler.getAccessList();
    if (this.noresult(res)) return;
    let enterpriseFInfo = res.msgArr.filter(i => i.fInfo.fileName == '企业共享文件夹');
    let enterpriseFId = enterpriseFInfo && enterpriseFInfo.length > 0 && enterpriseFInfo[0].fid;

    if (!!!search) {  // 根目录
      let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: enterpriseFId });
      this.setState({
        pathList: [],
        paramsforFiles,
        loading: true,
        parentId: enterpriseFId,
      }, () => {
        this.queryFiles();
        localStorage.removeItem('navigateInfoA');
      })
      return;
    }

    let fileId = getFileId(search, 'fileId');

    if (!fileId) {
      return;
    }
    // 请求getPacket
    let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: fileId });
    // 取路径
    let navigateObj = localStorage.getItem('navigateInfoA') && JSON.parse(localStorage.getItem('navigateInfoA')) || {};

    this.setState({
      loading: true,
      paramsforFiles,
      pathList: navigateObj && navigateObj.pathArr || [],
      parentId: enterpriseFId,
    }, () => {
      this.queryFiles();
    })
  }

  queryFiles = async () => {
    let { paramsforFiles } = this.state;
    let res = await NetHandler.listDir({ ...paramsforFiles });
    if (this.noresult(res)) return;
    this.setState({
      files: res,
      loading: false,
    })
  }

  noresult = (result) => {
    if (!result || result.resultCode !== RESULT_STATUS.SUCCESS) return true;
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
    localStorage.setItem('navigateInfoA', JSON.stringify(newObj)); //去除一级
    this.setState({ pathList: newarr });

    // 请求接口
    let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: fileInfo.fileId });
    this.setState({
      paramsforFiles
    }, () => {
      this.queryFiles();
    })
  }


  openFiles = (fileInfo) => {
    let isFolder = fileInfo.isFolder();
    switch (isFolder) {
      case true:  //文件夹
        let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: fileInfo.fileId });
        // 从缓存中拿 // { pathArr: [] }
        let navigateInfo = localStorage.getItem('navigateInfoA') ? localStorage.getItem('navigateInfoA') : {};
        let navigateArray = JSON.stringify(navigateInfo) == "{}" ? [] : JSON.parse(navigateInfo).pathArr;
        let newnavigateArray = navigateArray.concat([fileInfo]);
        let obj = { pathArr: newnavigateArray };
        // 从缓存存
        localStorage.setItem('navigateInfoA', JSON.stringify(obj));

        this.setState({
          paramsforFiles,
          sLoading: true,
          searchStatus: false,
          options: {},
        }, () => {
          this.queryFiles();
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

  handleSubmit = values => {
    let { parentId } = this.state;
    let { createTime, queryString } = values;
    queryString = queryString ? queryString.trim() : "";

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

    let options = Object.assign({}, this.state.options, { startTime, endTime });
    let paramsforSearch = Object.assign({}, this.state.paramsforSearch, { queryString, parentId });
    this.setState({ options, paramsforSearch, searchStatus: true, sLoading: true, pathList: [] }, () => {
      localStorage.removeItem('navigateInfoA');
      this.querySearchFiles();
    })
  }

  handleReset = () => {
    // 重置
    let { options, parentId } = this.state;
    this.setState({
      loading: true,
      paramsforSearch: { page: 0, pageSize: 10, did: parentId, type: FILE_TYPE.ALL },
      options: {},
      pathList: [],
      searchStatus: false,
    }, () => {
      this.queryFiles();
      localStorage.removeItem('navigateInfoA');
      let { history } = this.props;
      history.push('/files/share');
    });
  }

  closeEdit = async file => {
    let params = {
      fid: file.fileId
    }
    let res = await NetHandler.cancelShare({ ...params });
    if (this.noresult(res)) return;
    message.success('关闭成功');
    this.queryFiles();
  }

  closeShare = async file => {
    let params = {
      fid: file.fileId
    }
    let res = await NetHandler.closeLinkShare({ ...params });
    if (this.noresult(res)) return;
    message.success('关闭成功');
    this.queryFiles();
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
                  to={`/files/share?fileId=${record.fileId}`}
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
            {text.length > 10 &&
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
      width: 130,
    },
    {
      title: '文件状态',
      dataIndex: 'state',
      key: 'state',
      align: 'center',
      width: 120,
      render: state => <span className={`${styles[state]}`}>{stateObj[state]}</span>
    },
    {
      title: '更新时间',
      dataIndex: 'mtime',
      key: 'mtime',
      align: 'center',
      width: 200,
      render: (time, record) => {
        return <span>{time ? time : record.ctime}</span>
      }
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      align: 'center',
      width: 130,
      render: size => {
        return <span>{unitConversion(size)}</span>
      }
    },
    {
      title: '分享',
      key: 'share',
      align: 'center',
      width: 80,
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
      width: 80,
      render: (_, record) => {
        let fileInfo = YZFile(record);
        return (
          <Popconfirm
            title="确定关闭协作吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.closeEdit(record)}
            disabled={!(fileInfo.isInviteSharing == 1)}
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
      render: (_, record) => {
        return <>
          <Popconfirm
            title="确定删除文件吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.deleteFile(record.fileId)}
            onCancel={() => null}
            disabled={record.state == '1'}
          >
            <Button type="link" danger disabled={record.state == '1'}>删除</Button>
          </Popconfirm>
          <Button onClick={() => this.downloadFile(record.fileId)} type="link" disabled={record.state == 'delete'}>下载</Button>
        </>
      }
    }
  ]
  render() {
    const { selectedRowKeys, pathList, loading, files, sLoading, searchFiles, searchStatus, paramsforSearch, parentId, paramsforFiles } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const hasChoose = selectedRowKeys.length > 0;
    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>群企业共享文档管理</Typography.Title>

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
                    <Link to={`/files/share?fileId=${i.fileId}`} >{i.fileName}</Link>
                  </Breadcrumb.Item>
                )
              })
            }
          </Breadcrumb>
        }

        <SearchFormShare
          handleSubmit={this.handleSubmit}
          handleReset={this.handleReset}
        />
        {
          !searchStatus &&
          <>
            <Table
              columns={this.columns}
              dataSource={files && files.resultSet && files.resultSet.fileInfos}
              scroll={{ x: 1300 }}
              rowSelection={rowSelection}
              loading={loading}
              pagination={{
                current: Number(paramsforFiles.page) + 1,
                total: files && Number(files.pages) * 10 || 10,
                pageSize: 10,
                onChange: this.handlePageChange,
                // showQuickJumper: true,
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
              loading={sLoading}
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

export default ShareFiles;
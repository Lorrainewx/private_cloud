import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Link, } from 'umi';
import { Typography, Table, Button, Popconfirm, Modal, Breadcrumb, message, Row, Col } from 'antd';
import SearchFormDepartment from './searchForm';
import SearchTree from '@/components/SearchTree';
import { timestampToTime, unitConversion, generateUuid, getCookie, Base64_decode } from '@/utils/utils';
import { connect } from 'dva';
import { omit } from 'lodash';
import FileTypeIconMap from '@/utils/files/filesIconMap';
import YZFile from "@/utils/files/fileInfo";
import NetHandler from '@/utils/pomelo/netHandler';
import { formatterForTreeData, getFileId, sortByTime } from '@/utils/cloud';

import styles from './index.less';

import { RESULT_STATUS } from '@/const/STATUS';
import FILE_TYPE from '@/const/FILE_TYPE';

const stateObj = {
  '1': '已删除',
  '0': '正常',
  '2': '已回收',
}

@connect(({ enterprise, file, user }) => ({
  enterprise,
  file,
  currentUser: user.currentUser,
}))
class DepartmentFiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      iframeVisible: false,
      defaultExpandedKeys: [],  //默认展开值
      paramsforFiles: { // 筛选列表参数
        type: FILE_TYPE.ALL,
        page: 0,
        pageSize: 10,
      },
      paramsforSearch: { // 搜索文件参数
        page: 0,
        pageSize: 10,
      },
      searchFiles: {},  //搜索文件的值
      options: {},
      loading: false,  //列表加载中
      files: {}, //文件列表
      listDirParams: {
        pageSize: 10,
        type: FILE_TYPE.ALL,
        page: 0,
      },
      searchStatus: false,  //搜索状态
      pathList: [], //路径list
      dpId: undefined,  //当前部门ID
      sLoading: false,  //搜索loading
      canReset: false,
    };
  }

  componentDidMount() {
    console.log('componentDidMount');
    const { location: { search } } = this.props;
    this.queryDepartments();  // 部门列表 最大部门文件
    this.load(search);
  }

  componentDidUpdate(prevProps) { // 进子目录
    const { dispatch, location: { search } } = this.props;
    let { location: { search: prevSearch } } = prevProps;
    if (prevSearch == search && search.indexOf('item') < 0) {
      return;
    }
    this.load(search, true);
  }

  load = (search, update = false) => {
    if (!!!search) {
      this.setState({
        pathList: [],
      })
      // 一切归零 重新加载当前部门的文件列表
      localStorage.removeItem('navigateInfoD');
      if (update) {
        let { dpId } = this.state;
        let listDirParams = Object.assign({}, this.state.listDirParams, { departmentId: dpId, page: 0 });
        this.setState({
          listDirParams,
          loading: true,
        }, () => {
          this.listDirByDepartmentId();
        })
      }
      return;
    }

    let fileId = getFileId(search, 'fileId');
    let departmentId = getFileId(search, 'departmentId');

    if (!fileId) { //请求部门列表      
      return;
    }

    // 请求文件列表
    let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: fileId, page: 0 });
    // 取路径
    let navigateObj = localStorage.getItem('navigateInfoD') && JSON.parse(localStorage.getItem('navigateInfoD')) || {};

    this.setState({
      loading: true,
      paramsforFiles,
      dpId: departmentId,
      pathList: navigateObj && navigateObj.pathArr || [],
    }, () => {
      this.queryListDirFiles();
    })
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

  querySearchFiles = async () => {
    console.log('执行 querySearchFiles');
    let { options, paramsforSearch } = this.state;
    let res = await NetHandler.searchFileByDepartmentId({
      options,
      ...paramsforSearch
    })
    if (this.noresult(res)) return;

    this.setState({ sLoading: false, searchFiles: res });
  }

  queryDepartments = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/fetchDepartments',
      payload: {
        members: false
      },
      callback: res => {
        if (res && res.code == RESULT_STATUS.SUCCESS) {
          let { dpId } = this.state;
          let id = res.data[0].id;
          this.setState({
            defaultExpandedKeys: [id],
            dpId: id
          });
        }
      }
    })
  }

  queryListDirFiles = async () => { // 目录列表
    let { paramsforFiles } = this.state;
    let res = await NetHandler.listDir({ ...paramsforFiles });
    if (this.noresult(res)) return;
    this.setState({
      files: res,
      loading: false
    });
  }

  listDirByDepartmentId = async () => { //部门列表
    console.log('加载部门列表');
    let { listDirParams } = this.state;
    let res = await NetHandler.listDirByDepartmentId(listDirParams);
    if (this.noresult(res)) return;
    this.setState({
      files: res,
      loading: false,
    })
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
    const { location: { search } } = this.props;
    let fileId = getFileId(search, 'fileId');
    if (!!fileId) {
      !searchStatus && this.queryListDirFiles();
    } else {
      !searchStatus && this.listDirByDepartmentId();
    }
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
        if (res && res.code == RESULT_STATUS.SUCCESS) {
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
    let res = await NetHandler.closeLinkShare({ ...params });
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
        let { location: { search } } = this.props;
        if (!!!search) {
          this.listDirByDepartmentId();
          return;
        }
        let fileId = getFileId(search, 'fileId');
        if (!fileId) {
          this.listDirByDepartmentId();
          return;
        }
        this.queryListDirFiles();
        break;
    }
  }


  handleReset = () => {
    let { params, listDirParams, dpId } = this.state;

    this.setState({
      params: omit(params, ['queryString']),
      options: {},
      loading: true,
      files: {},
      searchStatus: false,
      listDirParams: { pageSize: 10, page: 0, departmentId: dpId }, // 归零
      canReset: false,
    }, () => {
      this.listDirByDepartmentId();
    })
  }

  handleSubmit = (values) => {
    let { dpId } = this.state;
    let { status, createTime, queryString } = values;
    queryString = queryString ? queryString.trim() : "";
    status = status || status == 0 ? [status] : [0, 1, 2];

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

    if (queryString == "" && startTime == null && endTime == null && !status) {
      message.error('请选择筛选条件');
      return;
    }

    let options = Object.assign({}, this.state.options, { status, startTime, endTime });
    let paramsforSearch = Object.assign({}, this.state.paramsforSearch, { queryString, departmentId: dpId });
    this.setState({ options, paramsforSearch, searchStatus: true, sLoading: true, pathList: [], canReset: true, }, () => {
      localStorage.removeItem('navigateInfoD');
      this.querySearchFiles();
    })
  }

  handlePageChange = (pageNumber, pageSize) => {  // 成员信息 页码查询
    let { searchStatus, listDirParams, paramsforFiles, paramsforSearch } = this.state;
    const { location: { search } } = this.props;
    let fileId = getFileId(search, 'fileId');

    if(!!fileId && !searchStatus) {
      paramsforFiles = Object.assign({}, this.state.paramsforFiles, { page: pageNumber - 1 });
    } else {
      listDirParams = Object.assign({}, this.state.listDirParams, { page: pageNumber - 1 });
    }
    if(searchStatus) {
      paramsforSearch = Object.assign({}, this.state.paramsforSearch, { page: pageNumber - 1 });
    }

    this.setState({ 
      listDirParams, 
      paramsforSearch, 
      paramsforFiles, 
      sLoading: true, 
      loading: true, 
    }, () => {
      searchStatus && this.querySearchFiles();  // 查询状态下
      if (!!fileId) { // 子级目录
        !searchStatus && this.queryListDirFiles();
      } else {  // 一级部门
        !searchStatus && this.listDirByDepartmentId();
      }
    });
  }

  handleListDirPageChange = () => { // 文件目录下一级

  }

  noresult = (result) => {
    if (!result || result.resultCode !== RESULT_STATUS.SUCCESS) return true;
  }

  openFiles = (fileInfo) => {
    console.log('文件信息：', fileInfo);
    let isFolder = fileInfo.isFolder();
    switch (isFolder) {
      case true:  // 文件夹
        let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: fileInfo.fileId });
        // 从缓存中拿 // { pathArr: [] }
        let navigateInfo = localStorage.getItem('navigateInfoD') ? localStorage.getItem('navigateInfoD') : {};
        let navigateArray = JSON.stringify(navigateInfo) == "{}" ? [] : JSON.parse(navigateInfo).pathArr;
        let newnavigateArray = navigateArray.concat([fileInfo]);
        let obj = { pathArr: newnavigateArray };
        // 从缓存存
        localStorage.setItem('navigateInfoD', JSON.stringify(obj));

        this.setState({
          paramsforFiles,
          loading: true,
          searchStatus: false,
        }, () => {
          this.queryListDirFiles();
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

  closeModal = () => {
    this.setState({ iframeVisible: false });
  }

  columns = [
    {
      title: '文件名',
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
                ? <Link to={`/files/department?fileId=${record.fileId}&departmentId=${this.state.dpId}`} className={styles.fileName} style={{ color: "rgba(0,0,0, .65)" }}>
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
            {text.length > 10 && <span className={styles.allwords}>{text}</span>}
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
      key: 'state',
      align: 'center',
      width: 100,
      render: state => <span className={`${styles[state]}`}>{stateObj[state]}</span>
    },
    {
      title: '更新时间',
      dataIndex: 'mtime',
      key: 'mtime',
      align: 'center',
      width: 200,
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
      width: 200,
      render: (_, record) => {
        return <>
          <Popconfirm
            title="确定删除文件吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.deleteFile(record.fileId)}
            disabled={record.state == '1'}
            onCancel={() => null}
          >
            <Button type="link" danger disabled={record.state == '1'}>删除</Button>
          </Popconfirm>
          <Button onClick={() => this.downloadFile(record.fileId)} type="link" disabled={record.state == '1'}>下载</Button>
        </>
      }
    }
  ]
  onSelectChange = selectedRowKeys => {
    console.log('已选择列 ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  treeItemClick = (value) => {
    console.log(value, '部门ID');
    // 请求folderId
    let listDirParams = Object.assign({}, this.state.listDirParams, { departmentId: value, page: 0 });

    this.setState({
      listDirParams,
      loading: true,
      pathList: [],
      dpId: value,
      searchStatus: false,
      paramsforSearch: { page: 0, pageSize: 10 },
      options: {},
    }, () => {
      this.listDirByDepartmentId();
      localStorage.removeItem('navigateInfoD'); // 部门文件的路径

      const { history } = this.props;
      if (window.location.search != "") {
        history.replace({
          pathname: '/files/department',
          search: 'item'
        });
      }
    });
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
    localStorage.setItem('navigateInfoD', JSON.stringify(newObj)); //去除一级
    this.setState({ pathList: newarr });

    // 请求接口  文件列表 listDir
    // let paramsforFiles = Object.assign({}, this.state.paramsforFiles, { did: fileInfo.fileId });
    // this.setState({
    //   paramsforFiles
    // }, () => {
    //   this.queryPacketFiles();
    // })
  }

  render() {
    const { selectedRowKeys, defaultExpandedKeys, loading, files, paramsforFiles, listDirParams, pathList, dpId, searchStatus, searchFiles, sLoading, paramsforSearch, canReset } = this.state;

    let {
      enterprise: { departments },
      location: { search }
    } = this.props;

    departments = departments && departments.data || [];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const hasChoose = selectedRowKeys.length > 0;
    
    let fileId = getFileId(search, 'fileId');
    
    // 文件列表
    let fileInfos = files && files.resultSet && files.resultSet.fileInfos || [];
    fileInfos = sortByTime(fileInfos);

    // 筛选文件列表
    let searchArr = searchFiles && searchFiles.fileArr || [];
    searchArr = sortByTime(searchArr);

    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>部门文档管理</Typography.Title>
        <Row gutter={20}>
          <Col span={6} style={{ marginTop: '30px' }}>
            <SearchTree
              placeholder="搜索部门"
              treeData={formatterForTreeData(departments)}
              defaultExpandedKeys={defaultExpandedKeys}
              onSelect={this.treeItemClick}
              showAddDepbtn={false}
              hasOnselect={true}
            // value={dpId}
            />
          </Col>
          <Col span={18}>
            {
              pathList.length > 0 &&
              <Breadcrumb style={{ margin: '34px 0 20px' }}>
                {
                  pathList.map(i => {
                    return (
                      <Breadcrumb.Item
                        onClick={() => this.backtofiles(i)}
                        style={{ cursor: 'pointer' }}
                        key={i.fileId}
                      >
                        <Link to={`/files/department?fileId=${i.fileId}&departmentId=${this.state.dpId}`} >{i.fileName}</Link>
                      </Breadcrumb.Item>
                    )
                  })
                }
              </Breadcrumb>
            }
            <SearchFormDepartment
              defaultExpandedKeys={defaultExpandedKeys}
              canReset={canReset}
              treeData={formatterForTreeData(departments)}
              handleSubmit={this.handleSubmit}
              handleReset={this.handleReset}
            />
            {
              searchStatus &&
              <>
                <Table
                  columns={this.columns}
                  dataSource={searchArr}
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
            {
              !searchStatus &&
              <>
                <Table
                  rowSelection={rowSelection}
                  columns={this.columns}
                  dataSource={fileInfos}
                  scroll={{ x: 1400 }}
                  pagination={{
                    size: 'small',
                    pageSize: 10,
                    total: Number(files.pages * 10),
                    current: !!fileId || fileId == 0 ? Number(paramsforFiles.page + 1) : Number(listDirParams.page + 1),
                    onChange: this.handlePageChange,
                    // showQuickJumper: true
                  }}
                  loading={loading}
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

          </Col>
        </Row>
      </PageHeaderWrapper>

    )
  }
}

export default DepartmentFiles;
import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Col, Form, Radio, Typography, Upload, Avatar, Select, message, Input, DatePicker } from 'antd';
import { PlusOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { connect } from 'dva';
import { omit } from 'lodash';
import moment from 'moment';
import defaultSetting from '../../../../config/defaultSettings';
import { timestampToTime } from '@/utils/utils';
import { isWebUrlStr, isBlankReg, isAddStr, isEmailStr, isIllegalStr2, isContactStr } from '@/utils/reg';
import { RESULT_STATUS } from '@/const/STATUS';
import companyType from '@/data/companyType';
import companyScale from '@/data/companyScale';
import styles from "./index.less";

const { devAuth } = defaultSetting;
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
}

@connect(({ global, enterprise }) => ({
  global,
  enterprise,
}))
class Infrastructure extends React.Component {
  state = {
    loading: false,
    isEdit: false,  // 是否是编辑状态
    fileList: [],
  }

  componentDidMount() {
    // 图标初始化
    let imageUrl = `${devAuth}/epauth/api/corp/logo`;
    this.setState({ imageUrl });
  }

  onFinish = values => {
    let { versionLimit } = values;
    const newValues = omit(values, ['expireTime', 'companyLogo']);

    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/update',
      payload: {
        ...newValues
      },
      callback: (res) => {
        if (res.code == RESULT_STATUS.SUCCESS) {
          this.updateVersionLimit({ versionLimit }, r => {
            if (r.code === RESULT_STATUS.SUCCESS) {
              message.success('保存成功！');
              this.setState({ isEdit: false });
              this.updateEpInfo();  // 更新企业信息
            }
          });
        }
      }
    })

  }

  updateVersionLimit = (params, cb) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterprise/updateVersionLimit',
      payload: params,
      callback: res => {
        cb && typeof cb == 'function' && cb(res);
      }
    })
  }

  updateEpInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchEpInfo'
    })
    dispatch({
      type: 'enterprise/fetch'
    })
  }
  handleUploadLogo = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          loading: false,
        }),
      );
    }
  };

  beforeUpload = (e) => {
  }

  settingEdit = () => {
    this.setState({ isEdit: true });
  }

  // 验证  
  // 企业邮箱
  validateToEmail = (_, value) => {
    let result = isEmailStr(value);
    if (result || !value) {
      return Promise.resolve();
    } else {
      return Promise.reject('企业邮箱格式有误');
    }
  }

  validateToName = (_, value, min, max) => {
    let result = value.length;
    if (value.length > min && value.length < max || value.length < 1) {
      return Promise.resolve();
    } else {
      return Promise.reject(`请输入${min}-${max}个字符`);
    }
  }

  // 验证是否有非法字符
  validateToIllegleStr = (_, value) => {
    let result = value;
    if (isIllegalStr2(result) || !value) {
      return Promise.resolve();
    } else {
      return Promise.reject(`不支持除.以外的特殊字符`);
    }
  }

  // 企业地址
  validateToAdd = (_, value) => {
    let result = isAddStr(value);
    if (result || !value) {
      return Promise.resolve();
    } else {
      return Promise.reject('企业地址格式有误');
    }
  }

  // 企业网址
  validateToWebUrl = (_, value) => {
    let result = isWebUrlStr(value);
    if (result || !value) {
      return Promise.resolve();
    } else {
      return Promise.reject('企业网站格式有误');
    }
  }

  // 联系方式
  validateToContact = (_, value) => {
    let result = isContactStr(value);
    if (result || !value) {
      return Promise.resolve();
    } else {
      return Promise.reject('联系方式格式有误');
    }
  }


  render() {
    const { fileList, imageUrl, loading, isEdit } = this.state;
    const { global: { epInfo }, enterprise: { updateVLResult, enterpriseResult } } = this.props;
    let versionLimit = enterpriseResult && enterpriseResult.data && enterpriseResult.data.versionLimit || 10;
    let info = epInfo && epInfo.data ? { ...epInfo.data, versionLimit } : { versionLimit };

    const uploadButton = (
      <div>
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    let AvatarUrl = `${devAuth}/epauth/api/corp/logo`;
    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={3} style={{ fontWeight: 'normal' }}>基础设置</Typography.Title>
        <Form
          onFinish={this.onFinish}
          style={{ width: '500px', marginTop: '30px' }}
          className={styles.infoForm}
          initialValues={{ ...info }}
        >
          <h4 className={styles.title}>企业基础信息</h4>
          <Button type="primary" disabled={isEdit} onClick={this.settingEdit} style={{ marginLeft: '440px', marginBottom: '20px' }}>编辑</Button>

          <Form.Item label="企业图标" name="logo">
            {/* <img src={`${devAuth}/epauth/api/corp/logo`} alt="企业图标" hidden={isEdit} style={{ display: 'block' }} /> */}
            <div>
              <Upload
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={AvatarUrl}
                accept='.jpg, .jpeg, .png, .gif'
                multiple={false}
                // fileList={fileList}
                beforeUpload={this.beforeUpload}
                onChange={this.handleUploadLogo}
                disabled={!isEdit}
              >
                {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
              </Upload>
            </div>
            <span className='avatar_ts'>支持上传jpg, jpeg, png, gif格式；图片尺寸 500*500像素</span>
          </Form.Item>
          <Form.Item
            label="企业名称"
            name="name"
            rules={[
              { required: true, message: '请输入企业名称' },
            ]}
          >
            <Input placeholder='请输入企业名称' disabled={!isEdit} autoComplete="off" minLength={2} maxLength={50} />
          </Form.Item>
          <Form.Item
            label="企业简称"
            name="abbrev"
            rules={[
              { required: true, message: '请输入企业简称' },
            ]}
          >
            <Input placeholder='请输入企业简称' disabled={!isEdit} autoComplete="off" minLength={2} maxLength={20} />
          </Form.Item>
          <Form.Item
            label="企业邮箱"
            name="email"
            rules={[
              { validator: async (_, value) => await this.validateToEmail(_, value) }
            ]}
          >
            <Input placeholder='请输入企业邮箱' disabled={!isEdit} autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="企业地址"
            name="address"
            rules={[
              { validator: async (_, value) => await this.validateToAdd(_, value) }
            ]}
          >
            <Input placeholder='请输入企业所在地址' disabled={!isEdit} autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="企业网站"
            name="site"
            rules={[
              { validator: async (_, value) => await this.validateToWebUrl(_, value) }
            ]}
          >
            <Input placeholder='请输入企业官网地址' disabled={!isEdit} autoComplete="off" />
          </Form.Item>
          <Form.Item label="行业类型" name="industry">
            <Select placeholder="行业类型" disabled={!isEdit} >
              {
                companyType.map((item, index) => <Select.Option value={index} key={index}>{item.type}</Select.Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item label="公司规模" name="corpSize">
            <Select placeholder="公司规模" disabled={!isEdit} >
              {
                companyScale.map((item, index) => <Select.Option value={index} key={index}>{item.type}</Select.Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item label="有效期" name="expireTime">
            <Input placeholder='请输入有效期' disabled={!isEdit} autoComplete="off" />
            {/* <DatePicker 
              showTime
              // value={epInfo.data.expireTime ? moment(epInfo.data.expireTime, dateFormat) : undefined}
              // onChange={(val) => {
              //   onUpdateCompensateListInfo('startTime', moment(val, dateFormat))
              // }} 
            /> */}
          </Form.Item>
          <h4 className={styles.title}>联系人信息</h4>
          <Form.Item
            label="联系人姓名"
            name="contactName"
            rules={[
              { required: true, message: '请输入联系人姓名' },
              { validator: async (_, value) => await this.validateToName(_, value, 0, 20) },
              { validator: async (_, value) => await this.validateToIllegleStr(_, value) },
            ]}
          >
            <Input placeholder='请输入联系人姓名' disabled={!isEdit} autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="联系人电话"
            name="contactPhone"
            rules={[
              { required: true, message: '请输入联系人电话' },
              { validator: async (_, value) => await this.validateToContact(_, value) },
            ]}
          >
            <Input placeholder='请输入联系人电话' type="tel" disabled={!isEdit} autoComplete="off" />
          </Form.Item>
          <h4 className={styles.title}>其他设置</h4>
          <Form.Item label="单个文件历史版本" name="versionLimit">
            <Input placeholder='默认历史版本数为10' disabled={!isEdit} type="number" min={0} />
          </Form.Item>
          {/* <Col>
            <Form.Item label="创建群组是否需要审批" name="groupApproval">
              <Radio.Group placeholder="创建群组是否需要审批" name="sex" defaultValue={0}>
                <Radio value={0}>是</Radio>
                <Radio value={1}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col> */}
          {/* <Col>
            <Form.Item label="创建部门时是否自动创建对应的群组" name="createGroup">
              <Radio.Group placeholder="创建部门时是否自动创建对应的群组" name="sex" defaultValue={0}>
                <Radio value={0}>是</Radio>
                <Radio value={1}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col> */}

          <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }} disabled={!isEdit}>保存</Button>
        </Form>
      </PageHeaderWrapper>
    )
  }
}

export default Infrastructure;

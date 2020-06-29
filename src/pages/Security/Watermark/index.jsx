import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {Typography, Radio, Select, Switch, Input, Button, Upload, message, Modal} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import styles from './index.less';
import { connect } from 'dva';
import {Image} from "echarts/src/util/graphic";
const { Option } = Select;
const transparencyArr = [10, 20, 30, 40, 50, 60, 70, 80, 90];

@connect(({ watermarks }) => ({
  watermarks
}))

class Watermark extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wordFlag: false, // 三者选其一
      pictureFlag: false,
      userNameFlag: false,
      fileList: [],
      waterMarkInfo: {},
      previewVisible:false,
      previewSrc:null,
    }
    console.log('constructor')
  }

  componentDidMount() {
    this.getEnterpriseWaterMark();
  }

  getEnterpriseWaterMark() {
    var self = this
    const {dispatch} = this.props;
   dispatch({
     type:'watermarks/getEnterpriseWaterMark',
     callback:(res)=>{
       if(res.success){
         this.setState({ waterMarkInfo: res.data });
         switch (res.data.watermarkType) {
           case 0:
            self.setFlag(false,'wordFlag','userNameFlag')
             break
           case 1:
             self.setFlag(true,'wordFlag','userNameFlag')
             break
           case 3:
             self.setFlag(true,'userNameFlag','wordFlag')
             break
         }
         // let state = Object.assign({},this.state,res.data);
         // self.setState({ state }, () => {
         //   console.log(self.state);
         // })

       }
     }
   })
 }
  setFlag =(value,type1,type2)=>{
    if(!value){
      this.setState({ [type1]: false ,[type2]: false});
    }else{
      this.setState({[type1]:true,[type2]: false})
    }

}
  // onChange =(e)=>{
  //
  //   this.setState({ wordWaterMark: e.target.value });
  // }

  onChange = (e, type) => {
    console.log('----e',e.target.value)
      console.log('-----type',type)
    let waterMarkInfo = Object.assign({},this.state.waterMarkInfo, { [type]: e.target.value });
    this.setState({ waterMarkInfo },()=>{
      this.modifyWaterMark();
    });
  }
  changeWordWaterMark = (e, type) => {
    let waterMarkInfo = Object.assign({},this.state.waterMarkInfo, { [type]: e.target.value });
    this.setState({ waterMarkInfo });
  }
  changeTransparency = (value,type) => {
    let waterMarkInfo = Object.assign({}, this.state.waterMarkInfo, { [type]:value });
    this.setState({waterMarkInfo},()=>{
      this.modifyWaterMark();
    });
    // console.log('chooseWatermark----e',e.target.value)
    // console.log('chooseWatermark-----type',type)
    // this.setState({ watermarkTransparent: value },()=>{
    //
    // });

  }

  switchforWatermark = (value, currentType, type1, type2) => {
    this.setState({ [currentType]: value }, () => {
      this.modifyWaterMark();
    });
    if (value) {
      if(currentType != 'wordFlag'){
        this.setState({wordWaterMark:''});
      };
     let watermarkType;
      switch (currentType) {
        case 'wordFlag':
          watermarkType = 1;
          break;
        case 'userNameFlag':
          watermarkType = 3;
          break;
      }
      let waterMarkInfo = Object.assign({}, this.state.waterMarkInfo, { watermarkType });
      this.setState({
        waterMarkInfo,
        [type1]: false, [type2]: false
      });

    }

    }
  modifyWaterMark = ()=>{
    let {wordFlag,pictureFlag,userNameFlag,waterMarkInfo} = this.state;
    let {watermarkType } =  waterMarkInfo
    if(wordFlag)  watermarkType= 1;
    else if(pictureFlag) watermarkType = 2;
    else if (userNameFlag) watermarkType = 3;
    else watermarkType = 0;
    const { dispatch} = this.props;
    dispatch({
        type:'watermarks/modifyWaterMark',
        payload:waterMarkInfo,
        callback:(res)=>{
          console.log('modify watermarks:',res);
        }
    })
  }
  //水印预览
  preview=()=>{
    this.setState({previewVisible:true})
    const {dispatch} = this.props;
    let {watermarkType,positionType,watermarkText,transparent}= this.state.waterMarkInfo
   if(watermarkText=''){
     message.error('请输入水印文字')
     return
   }
    let params={
      watermarkTransparent:transparent,
      watermarkType:watermarkType,
      wordWaterMark:watermarkText
    }
    dispatch({
      type:'watermarks/PreviewWaterMark',
      payload:params,
      callback:(res)=>{
        this.setState({previewSrc:res['url']})
      }
    })

  }
  handleChange = info => {
    let fileList = [...info.fileList];

    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    fileList = fileList.slice(-2);

    // 2. Read from response and show file link
    fileList = fileList.map(file => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });

    this.setState({ fileList });
  }
  wordWaterMarkConfirm=(a,b)=>{
    console.log('aaa',a)
    console.log('bbb',b)
  }
  render() {
    console.log('render')
    const textStyle = {
      fontSize: '16px',
      display: 'block',
      margin: '20px 0 15px'
    }

    const props = {
      action: '', // 服务器地址
      onChange: this.handleChange,
      multiple: true,
    };

    const { wordFlag, pictureFlag, userNameFlag, waterMarkInfo,previewVisible,previewSrc } = this.state;
    const { watermarkPositionType, watermarkScope, watermarkTransparent,wordWaterMark } = waterMarkInfo;
    console.log(waterMarkInfo, 'waterMarkInfo');
    return (
      <PageHeaderWrapper title={false}>
        <Typography.Title level={4} style={{ fontWeight: 'normal' }}>水印管理</Typography.Title>

        <Typography.Text style={{ ...textStyle }}>使用范围</Typography.Text>
        <Radio.Group onChange={e => this.onChange(e, 'watermarkScope')} value={watermarkScope}>
          <Radio value={0}>所有文档预览时开启水印</Radio>
          <Radio value={1}>所有对外共享文件需要开启水印</Radio>
          <Radio value={2}>文档共享者选择是否开启水印</Radio>
        </Radio.Group>

        <Typography.Text style={{ ...textStyle }}>展示位置</Typography.Text>
        <Radio.Group onChange={e => this.onChange(e, 'watermarkPositionType')} value={watermarkPositionType}>
          <Radio value={0}>斜角平铺（不支持图片水印）</Radio>
          {/*<Radio value={1}>文档中部（不重复）</Radio>*/}
          {/*<Radio value={2}>文档头尾</Radio>*/}
        </Radio.Group>

        <Typography.Text style={{ ...textStyle }}>水印效果</Typography.Text>
        <>
          <span>不透明度：</span>
          <Select style={{ width: '100px', marginLeft: '10px' }} value={watermarkTransparent} onChange={(v)=>this.changeTransparency(v,'watermarkTransparent')}>
            {
              transparencyArr.map((item, index) => <Option key={item} value={item}>{item}%</Option>)
            }
          </Select>
        </>

        <Typography.Text style={{ ...textStyle }}>水印种类</Typography.Text>
        <div className={styles.item}>
          <span>固定文字水印</span>
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            checked={wordFlag}
            onChange={value => this.switchforWatermark(value, 'wordFlag', 'pictureFlag', 'userNameFlag')}
          />
        </div>
        <div className={styles.wmContent} hidden={!wordFlag}>
          <span>输入水印内容</span>
          <Input placeholder="水印内容" value={wordWaterMark} onChange={(v)=>this.onChange(v,'wordWaterMark')}/>
          <Button type="primary" ghost onClick={this.preview}>预览效果</Button>
          <Button type="primary" onClick={this.modifyWaterMark} name='wordWaterMark'>确定</Button>
        </div>
        <Modal
          visible={previewVisible}
          title='水印预览'
          destroyOnClose={true}
          maskClosable={true}
          width="780px"
          footer={null}
          onCancel={() => this.setState({visible:false,isValue:false})}
          onOk={() => this.setState({visible:false,isValue:false})}
        >
          <Image src={previewSrc}  />
        </Modal>
        <div className={styles.item} hidden={true}>
          <span>图片水印</span>
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            checked={pictureFlag}
            onChange={value => this.switchforWatermark(value, 'pictureFlag', 'wordFlag', 'userNameFlag')}
          />
        </div>
        <div className={styles.wmContent} hidden={!pictureFlag} >
          <Upload {...props} fileList={this.state.fileList} accept="image/*">
            <Button>
              <UploadOutlined /> 上传图片
            </Button>
          </Upload>
          <Button type="primary" ghost>预览效果</Button>
          <Button type="primary">确定</Button>
        </div>

        <div className={styles.item}>
          <span>用户名水印</span>
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            checked={userNameFlag}
            onChange={value => this.switchforWatermark(value, 'userNameFlag', 'wordFlag', 'pictureFlag')}
          />
        </div>
        <div style={{ color: '#ff0000' }} hidden={!userNameFlag}>开启该水印，显示水印为查看者的用户名</div>
      </PageHeaderWrapper>
    )
  }
}

export default Watermark;

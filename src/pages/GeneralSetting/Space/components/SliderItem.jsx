import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Row, Col, Progress, Modal, Input, Form, Button, Select, TreeSelect } from 'antd';
import { isNumStr } from '@/utils/reg';
import { unitConversion } from '@/utils/utils';
import styles from '../index.less';


class SliderItem extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    visible: false,
    roleId: 0,  // 角色ID
    departmentId: 0,  //部门ID
  };

  showModal = (flag = true) => {
    this.setState({
      visible: flag,
    });
  };

  onFinish = (values, spaceType) => {

    const { handleOk } = this.props;
    const { departmentId, roleId } = this.state;
    let params = values;
    if(spaceType === 'memberSpace') {
      params = { ...params, roleId, departmentId };
    }
    handleOk && typeof handleOk == 'function' && handleOk(params, spaceType);
    this.showModal(false);
  }

  selectDepartmentRole = (value) => {
    // 角色
    this.setState({ roleId: value });
  }

  selectDepartment = value => {
    // 部门
    this.setState({ departmentId: value });
  }

  validateToSpaceLimit = (_, value) => {
    let result = isNumStr(value);
    if (result) {
      return Promise.resolve();
    } else {
      return Promise.reject(`请输入纯数字`);
    }
  }

  render() {
    const { visible } = this.state;
    const { spaceValue, allSpace, spaceType, name, showTextChange, corpRoles, treeData } = this.props;
    const perNum = (spaceValue.used / spaceValue.total).toFixed(4) * 100;

    const sliderStyle = {
      margin: '40px 0',
      width: '600px',
    };

    const textStyle = {
      fontWeight: 'bold',
    }
    return (
      <>
        <Row className='space-row' style={{ ...sliderStyle }}>
          <Col span={12}>
            <div className={styles.titleLt}>
              {name}空间
              <a
                hidden={!showTextChange}
                onClick={() => this.showModal()}
                className={styles.title}
              >
                批量设置{name}空间限制
              </a>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.titleRt}><em>已经占用{unitConversion(spaceValue.used)}</em><em>占比{perNum}%</em></div>
          </Col>
          <Progress percent={perNum} />
        </Row>
        {
          spaceType !== 'memberSpace' &&
          <Modal
            title="修改空间大小"
            visible={visible}
            onCancel={() => this.showModal(false)}
            destroyOnClose={true}
            footer={null}
          >
            <Form
              onFinish={(values) => this.onFinish(values, spaceType)}
            >
              <Form.Item
                name="spaceLimit"
                rules={[
                  { validator: async (_, value) => await this.validateToSpaceLimit(_, value) }
                ]}
              >
                <Input
                  placeholder='请输入空间大小'
                  autoComplete="off"
                  addonAfter={"MB"}
                />
              </Form.Item>
              <div className={styles.btns}>
                <Button type="primary" ghost style={{ marginRight: '10px' }} onClick={() => this.showModal(false)}>取消</Button>
                <Button htmlType="submit" type="primary">确定</Button>
              </div>
            </Form>
          </Modal>
        }
        {/* 个人空间设置 */}
        {
          spaceType === 'memberSpace' &&
          <Modal
            title="修改空间大小"
            visible={visible}
            onCancel={() => this.showModal(false)}
            destroyOnClose={true}
            footer={null}
          >
            <Form
              onFinish={(values) => this.onFinish(values, spaceType)}
            >
              <Typography.Text style={{ ...textStyle }}>选择用户</Typography.Text>
              <Form.Item
                label="筛选用户："
              >
                <Select
                  placeholder="角色"
                  onSelect={this.selectDepartmentRole}
                  style={{ marginBottom: '10px' }}
                >
                  {
                    corpRoles.map(item => {
                      return (
                        <Option value={item.id} key={item.id}>{item.name}</Option>
                      )
                    })
                  }
                </Select>
                <TreeSelect
                  treeData={treeData}
                  multiple={false}
                  placeholder="部门"
                  onSelect={this.selectDepartment}
                />
              </Form.Item>

              <Typography.Text style={{ ...textStyle }}>批量设定所选用户空间上限</Typography.Text>
              <Form.Item
                label="空间上限："
                name="spaceLimit"
                rules={[
                  { validator: async (_, value) => await this.validateToSpaceLimit(_, value) }
                ]}
              >
                <Input
                  placeholder='输入存储空间上限，用户存储超过限制将无法上传'
                  autoComplete="off"
                  addonAfter={"GB"}
                />
              </Form.Item>
              <div className={styles.btns}>
                <Button type="primary" ghost style={{ marginRight: '10px' }} onClick={() => this.showModal(false)}>取消</Button>
                <Button htmlType="submit" type="primary">确定</Button>
              </div>
            </Form>
          </Modal>
        }
      </>
    )
  }
}

export default SliderItem;

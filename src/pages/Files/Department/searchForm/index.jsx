import React from 'react';
import moment from 'moment';
import { Form, DatePicker, TreeSelect, Select, Input, Button, Row, Col, } from 'antd';
import styles from '../index.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

class SearchFormDepartment extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
    }

    resetfields = () => {
        this.formRef.current.resetFields();
        const { handleReset } = this.props;
        handleReset && typeof handleReset == 'function' && handleReset();
    }

    onFinish = values => {
        const { handleSubmit } = this.props;
        handleSubmit && typeof handleSubmit == 'function' && handleSubmit(values);
    }

    render() {
        const layoutCol = {
            xxl: 8,
            xl: 12,
            md: 24,
        }

        return (
            <Form
                className={styles.searchForm}
                wrapperCol={{ span: 16 }}
                layout="inline"
                ref={this.formRef}
                onFinish={this.onFinish}
            >
                <Row>
                    <Col span={20}>
                        <Row gutter={16}>
                            <Col {...layoutCol}>
                                <Form.Item label="文件状态：" name="status">
                                    <Select placeholder="文件状态">
                                        <Option value={1}>已删除</Option>
                                        <Option value={0}>正常</Option>
                                        <Option value={2}>已回收</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col {...layoutCol}>
                                <Form.Item label="搜索内容：" name="queryString">
                                    <Input placeholder="文件名/创建人" autoComplete="off" />
                                </Form.Item>
                            </Col>
                            <Col {...layoutCol}>
                                <Form.Item label="更新时间：" name="createTime">
                                    <RangePicker
                                        disabledDate={(current) => current && current > moment().endOf('day')}
                                        format={'YYYY-MM-DD'}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <div style={{ position: 'absolute', right: '20px' }}>
                        <Button htmlType="submit" type="primary" style={{ marginRight: '10px' }}>查询</Button>
                        <Button type="primary" ghost onClick={this.resetfields}>重置</Button>
                    </div>
                </Row>
            </Form>
        )
    }
}

export default SearchFormDepartment;

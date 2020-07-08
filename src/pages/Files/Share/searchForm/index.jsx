import React from 'react';
import { DatePicker, Form, Button, Input, Select, Row, Col, Spin, } from 'antd';
import moment from 'moment';
import debounce from 'lodash/debounce';
import styles from '../index.less';

const { MonthPicker, RangePicker } = DatePicker;
const { Option } = Select;

class SearchFormShare extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
    }

    onFinish = values => {
        const { handleSubmit } = this.props;
        handleSubmit && typeof handleSubmit == 'function' && handleSubmit(values);
    }

    onReset = () => {
        this.formRef.current.resetFields();
        const { handleReset } = this.props;
        handleReset && typeof handleReset == 'function' && handleReset();
    }

    render() {
        const layoutCol = {
            xl: 8,
            md: 24,
        }

        const { canReset } = this.props;

        return (
            <Form
                className={styles.searchForm}
                wrapperCol={{ span: 16 }}
                layout="inline"
                onFinish={this.onFinish}
                ref={this.formRef}
            >
                <Row>
                    <Col span={20}>
                        <Row gutter={16}>
                            <Col {...layoutCol}>
                                <Form.Item label="文件状态：" name="status">
                                    <Select placeholder="文件状态" getPopupContainer={(triggerNode)=>{ return triggerNode.parentNode}}>
                                        <Option value={0}>正常</Option>
                                        <Option value={1}>已删除</Option>
                                        <Option value={2}>彻底删除</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col {...layoutCol}>
                                <Form.Item label="搜索：" name="queryString" >
                                    <Input placeholder="请输入文件名/创建人" autoComplete="off" />
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
                    <div style={{ position: 'absolute', right: '30px' }}>
                        <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>查询</Button>
                        <Button type="primary" onClick={this.onReset} ghost disabled={!canReset}>重置</Button>
                    </div>
                </Row>
            </Form>
        )
    }
}

export default SearchFormShare;

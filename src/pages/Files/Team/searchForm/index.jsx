import React from 'react';
import { DatePicker, Form, Button, Input, Select, Row, Col, Spin, } from 'antd';
import moment from 'moment';
import debounce from 'lodash/debounce';
import styles from '../index.less';

const { MonthPicker, RangePicker } = DatePicker;
const { Option } = Select;

class SearchFormTeam extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
    }

    onReset = () => {
        this.formRef.current.resetFields();
        const { handleReset } = this.props;
        handleReset && typeof handleReset == 'function' && handleReset();
    }

    onFinish = values => {
        const { handleSubmit } = this.props;
        handleSubmit && typeof handleSubmit == 'function' && handleSubmit(values);
    }

    selectPacket = value => {
        const { handleSelect } = this.props;
        handleSelect && typeof handleSelect == 'function' && handleSelect(value);
    }

    render() {
        // const layoutCol2 = {
        //     xl: 9,
        //     lg: 9,
        //     md: 12,
        //     sm: 24
        // }

        const layoutCol = {
            xxl: 8,
            xl: 12,
            md: 24,
        }

        let { packets, defaultValue, canReset } = this.props;

        return (
            <Form
                className={styles.searchForm}
                wrapperCol={{ span: 16 }}
                layout="inline"
                ref={this.formRef}
                onFinish={this.onFinish}
            >
                <Row>
                    <Col {...layoutCol}>
                        <Form.Item label="所属群组：">
                            <Select
                                value={defaultValue}
                                showSearch
                                placeholder="所属群组"
                                onChange={this.selectPacket}
                                notFoundContent="企业中无此群组"
                                // onSearch={this.onSearch}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {packets.map(d => (
                                    <Option value={d.folderId} key={d.folderId}>{d.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row style={{ position: 'relative' }}>
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
                                <Form.Item label="搜索：" name="queryString">
                                    <Input placeholder="请输入文件名/创建人姓名" autoComplete="off" />
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
                    <div style={{ position: 'absolute', right: '30px', top: '0' }}>
                        <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>查询</Button>
                        <Button type="primary" ghost onClick={this.onReset} disabled={!canReset}>重置</Button>
                    </div>
                </Row>
            </Form>
        )
    }
}

export default SearchFormTeam;

import React from 'react';
import { Form, DatePicker, Select, Input, Button, Row, Col } from 'antd';
import moment from 'moment';
import styles from '../index.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

class SearchFormManage extends React.Component {
    formRef = React.createRef();

    onSelect = value => {
        const { handleSelect } = this.props;
        handleSelect && typeof handleSelect == 'function' && handleSelect(value);
    }

    onSearch = value => {
        const { handleSearch } = this.props;
        handleSearch && typeof handleSearch == 'function' && handleSearch(value);
    }

    onReset = () => {
        this.formRef.current.resetFields();
        const { handleReset } = this.props;
        handleReset && typeof handleReset == 'function' && handleReset();
    }

    onChangeDate = value => {
        const { handleChangeDate } = this.props;
        handleChangeDate && typeof handleChangeDate == 'function' && handleChangeDate(value);
    }

    render() {
        const layoutCol = {
            xxl: 8,
            xl: 12,
            lg: 12,
            md: 12,
            sm: 24
        }

        return (
            <Form
                className={styles.searchForm}
                wrapperCol={{ span: 16 }}
                layout="inline"
                ref={this.formRef}
            >
                <Row>
                    <Col span={20}>
                        <Row>
                            <Col {...layoutCol}>
                                <Form.Item label="群组状态：" name="state">
                                    <Select placeholder="群组状态" onChange={this.onSelect}>
                                        <Option value="0">正常</Option>
                                        <Option value="1">已解散</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col {...layoutCol}>
                                <Form.Item label="群组名：" name="name">
                                    {/* 不支持创建人 */}
                                    <Input.Search placeholder="请输入群组名" onSearch={this.onSearch} />
                                </Form.Item>
                            </Col>
                            <Col {...layoutCol}>
                                <Form.Item label="创建时间：" name="createTime">
                                    <RangePicker
                                        disabledDate={(current) => current && current > moment().endOf('day')}
                                        format={'YYYY-MM-DD HH:mm:ss'}
                                        showTime={true}
                                        onChange={this.onChangeDate}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <div style={{ position: 'absolute', right: '30px' }}>
                        <Button type="primary" ghost onClick={this.onReset}>重置</Button>
                    </div>
                </Row>
            </Form>
        )
    }
}

export default SearchFormManage;
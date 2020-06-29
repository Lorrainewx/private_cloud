import React from 'react';
import { Form, DatePicker, Select, Input, Button, Row, Col } from 'antd';
import styles from '../index.less';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

class SearchFormBulletinsManage extends React.Component {
    formRef = React.createRef();
    constructor(props) {
        super(props);

    }
    componentDidMount() {
    };

    onFinish = values => {
        const { handleScreen } = this.props;
        handleScreen && typeof handleScreen == 'function' && handleScreen(values);
    }
    onFinishFailed = (values, errorFields, outOfDate) => {

    }
    onReset = () => {
        this.formRef.current.resetFields();
        const { handleReset } = this.props;
        handleReset && typeof handleReset == 'function' && handleReset();
    }
    onSearch = value => {
        const { handleSearch } = this.props;
        handleSearch && typeof handleSearch == 'function' && handleSearch(value);
    }

    onChangeDate = (value) => {
        const { handleChangeDate } = this.props;
        handleChangeDate && typeof handleChangeDate == 'function' && handleChangeDate(value);

    }
    onChangStatus = (value) => {
        const { handleChangeStatus } = this.props;
        handleChangeStatus && typeof handleChangeStatus == 'function' && handleChangeStatus(value);
    }

    render() {
        const layoutCol = {
            xxl: 8,
            xl: 12,
            sm: 24
        }

        return (
            <Form
                className={styles.searchForm}
                wrapperCol={{ span: 16 }}
                layout="inline"
                ref={this.formRef}
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
            >
                <Row gutter={16}>
                    <Col span={22}>
                        <Row>
                            <Col {...layoutCol}>
                                <Form.Item label="状态查询：" name="state">
                                    <Select placeholder="公告状态" onChange={this.onChangStatus}>
                                        <Option value={0} key={0}>待发布</Option>
                                        <Option value={1} key={1}>已发布</Option>
                                        <Option value={2} key={2}>已过期</Option>
                                        <Option value={2} key={3}>已删除</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col {...layoutCol}>
                                <Form.Item label="搜索内容：" name="title"> {/*公告标题*/}
                                    <Input.Search placeholder="请输入发布人" onSearch={this.onSearch} />
                                </Form.Item>
                            </Col>
                            <Col {...layoutCol}>
                                <Form.Item label="创建时间：" name="createTime">
                                    <RangePicker
                                        disabledDate={(current) => current && current > moment().endOf('day')}
                                        onChange={this.onChangeDate} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={2}>
                        <Button type="primary" ghost onClick={this.onReset}>重置</Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default SearchFormBulletinsManage;

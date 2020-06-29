import React from 'react';
import { Form, DatePicker, Select, Input, Button, Row, Col } from 'antd';
import moment from 'moment';
import styles from '../index.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

class SearchFormBulletins extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);

    }
    componentDidMount() {
    };

    onSearch = value => {
        const { handleSearch } = this.props;
        handleSearch && typeof handleSearch == 'function' && handleSearch(value);
    }

    onFinishFailed = (values, errorFields, outOfDate) => {

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
            xl: 10,
            lg: 10,
            md: 11,
            sm: 20,
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
                    <Col {...layoutCol}>
                        <Form.Item label="搜索内容：" name="title">
                            <Input.Search placeholder="请输入发布人/公告标题" onSearch={this.onSearch} />
                        </Form.Item>
                    </Col>
                    <Col {...layoutCol}>
                        <Form.Item label="创建时间：" name="createTime" >
                            <RangePicker
                                disabledDate={(current) => current && current > moment().endOf('day')}
                                format={'YYYY-MM-DD HH:mm:ss'}
                                showTime={true}
                                onChange={this.onChangeDate}
                            />
                        </Form.Item>
                    </Col>
                    <div className={styles.btnn}>
                        <Button type="primary" ghost onClick={this.onReset}>重置</Button>
                    </div>
                </Row>
            </Form>
        )
    }
}

export default SearchFormBulletins;
import React from 'react';
import { Form, Select, Input, Button, Row, Col, } from 'antd';
import styles from '../index.less';

const { Option } = Select;

class SearchFormOrgStructure extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            role: undefined,
            accountType: undefined,
        }
    }

    onFinish = values => {
        // const { handleSearch } = this.props;
        // handleSearch && typeof handleSearch == 'function' && handleSearch(values);
    }

    onFinishFailed = (values, errorFields, outOfDate) => {

    }

    onSearch = (value) => {
        const { handleSearch } = this.props;
        handleSearch && typeof handleSearch == 'function' && handleSearch(value);
    }

    onReset = () => {
        this.formRef.current.resetFields();
        const { handleReset } = this.props;
        handleReset && typeof handleReset == 'function' && handleReset();
    }

    chooseRole = (value) => {
        this.setState({ role: value });
        const { handleChooseRole } = this.props;
        handleChooseRole && typeof handleChooseRole == 'function' && handleChooseRole(value);
    }

    chooseAccountState = value => {
        this.setState({ accountType: value });
        const { chooseAccountType } = this.props;
        chooseAccountType && typeof chooseAccountType == 'function' && chooseAccountType(value);
    }

    render() {
        const { roles, reset } = this.props;
        const { role, accountType } = this.state;
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
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
                ref={this.formRef}
            >
                <Row style={{position: 'relative'}}>
                    <Col span={20}>
                        <Row gutter={16}>
                            <Col {...layoutCol}>
                                <Form.Item label="选择角色：" >
                                    <Select placeholder="角色" onChange={this.chooseRole} value={reset ? undefined : role} getPopupContainer={(triggerNode)=>{ return triggerNode.parentNode}}>
                                        {
                                            roles.map(item => {
                                                return (
                                                   <Option value={item.id} key={item.id}>{item.name}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col {...layoutCol}>
                                <Form.Item label="状态：" >
                                    <Select placeholder="状态" onChange={this.chooseAccountState} value={reset ? undefined : accountType} getPopupContainer={(triggerNode)=>{ return triggerNode.parentNode}}>
                                        <Option value="1">禁用</Option>
                                        <Option value="0">正常</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col {...layoutCol}>
                                <Form.Item label="搜索：" name="name">
                                    <Input.Search placeholder="请输入成员姓名/手机号" onSearch={this.onSearch} />
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

export default SearchFormOrgStructure;

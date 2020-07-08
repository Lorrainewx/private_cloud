import React from 'react';
import { Form, Select, Input, Button, Row, Col, } from 'antd';
import styles from '../index.less';

const { Option } = Select;

class SearchFormManage extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
    }

    onScreen = value => {   // 筛选
        const { handleScreen } = this.props;
        handleScreen && typeof handleScreen == 'function' && handleScreen(value);
    }

    onSearch = value => {   // 搜索
        const { handleSearch } = this.props;
        handleSearch && typeof handleSearch == 'function' && handleSearch(value);
    }

    onReset = () => {
        this.formRef.current.resetFields();
        const { handleReset } = this.props;
        handleReset && typeof handleReset == 'function' && handleReset();
    }

    render() {
        const { roles } = this.props;
        const layoutCol = {
            xxl: 10,
            xl: 10,
            lg: 10,
            sm: 20,
        }

        return (
            <Form
                className={styles.searchForm}
                wrapperCol={{ span: 16 }}
                layout="inline"
                ref={this.formRef}
            >
                <Row gutter={16}>
                    <Col {...layoutCol}>
                        <Form.Item label="选择角色：" name="roleId">
                            <Select placeholder="角色" onChange={this.onScreen} getPopupContainer={(triggerNode)=>{ return triggerNode.parentNode}}>
                                <Option value={null} >所有角色</Option>
                                {
                                    roles.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col {...layoutCol}>
                        <Form.Item label="成员姓名/手机号：" name="name">
                            <Input.Search placeholder="搜索成员姓名/手机号" onSearch={this.onSearch} />
                        </Form.Item>
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

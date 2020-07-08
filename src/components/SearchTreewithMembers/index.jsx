import React from 'react';
import { Tree, Input, Button, Row, Col, Typography } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import defaultSettings from '../../../config/defaultSettings';
import SearchTree from '../SearchTree';
import styles from './index.less';

const { devAuth } = defaultSettings;

class SearchTreewithMembers extends React.Component {
    constructor(props) {
        super(props);
    }

    onCheck = (checkedKeys, info) => {
        const { onCheck } = this.props;
        onCheck && typeof onCheck == 'function' && onCheck(checkedKeys, info);
    }

    onSelect = (checkedKeys) => {
        const { onSelect } = this.props;
        onSelect && typeof onSelect == 'function' && onSelect(checkedKeys);
    }

    deletemem = (item) => {
        const { deletemem, group } = this.props;
        deletemem && typeof deletemem == 'function' && deletemem(item, group);
    }

    render() {
        const {
            checkedKeys,
            checkable,
            showAddDepbtn,
            treeData,
            defaultExpandedKeys,
            dataSource,
            placeholder,
            hasOnselect,
        } = this.props;
        return (
            <Row>
                <Col span={16}>
                    <SearchTree
                        placeholder="搜索成员姓名"
                        defaultExpandedKeys={defaultExpandedKeys}
                        treeData={treeData}
                        showAddDepbtn={false}
                        checkable={checkable}
                        checkedKeys={checkedKeys}
                        onCheck={this.onCheck}
                        onSelect={this.onSelect}
                        hasOnselect={hasOnselect}
                    />
                </Col>
                <Col span={8} style={{ paddingLeft: '20px', overflowY: 'auto', overflowX: 'hidden', maxHeight: '640px' }}>
                    <Typography.Text style={{ marginBottom: '15px', display: 'block' }}>已选择成员</Typography.Text>
                    {
                        dataSource.map(item => {
                            return (
                                <div className={styles.nameitem} key={item.id}>
                                    {item.id && <img
                                                    src={`${devAuth}/epauth/api/account/avatar?userId=${item.id}`}
                                                    style={{ width: '20px', height: '20px', marginRight: '5px' }}
                                                />}
                                    {item.name}({item.account})
                                    <CloseCircleFilled
                                        className={styles.close}
                                        onClick={() => this.deletemem(item)}
                                    />
                                </div>
                            )
                        })
                    }
                </Col>
            </Row>
        )
    }
}
export default SearchTreewithMembers;

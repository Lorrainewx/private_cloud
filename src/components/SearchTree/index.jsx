
import React from 'react';
import { Tree, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { uniq, cloneDeep } from 'lodash';
import { jsonToArray } from '@/utils/utils';
import styles from './index.less';

const { Search } = Input;

class SearchTree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
            expandedKeys: [],
            currentId: 0,
            isEx: false,
        }
    }

    onExpand = expandedKeys => {
        this.setState({
            isEx: true,
            expandedKeys: uniq(expandedKeys),
        });
    };

    handleSearch = e => {
        const { value } = e.target;
        this.setState({ searchValue: value });
        const { treeData, prefix } = this.props;
        let { expandedKeys } = this.state;
        const copyTreeData = cloneDeep(treeData);
        const dataList = jsonToArray(copyTreeData);
        dataList.map(item => {
            const { parent, id, title } = item;
            if (title.indexOf(value) >= 0 && value != "" && (parent != 0 || !!parent)) {
                !!!prefix && expandedKeys.push(parent);    // 纯id
                !!prefix && expandedKeys.push(prefix + parent);  // id基础之上加了前缀区分
                expandedKeys = uniq(expandedKeys);
                // 判断展开的expands的父id是否在里面
                for (let i in expandedKeys) {
                    let expandedKeysItem = expandedKeys[i];
                    for(let ii of dataList) {
                        if (expandedKeysItem == ii.id) {
                            expandedKeys.push(ii.parent);
                        }
                    }                    
                    expandedKeys = uniq(expandedKeys);
                }
                this.setState({ expandedKeys });
            }
        })
        this.setState({ expandedKeys });
    }

    highLight = data => {
        const { searchValue, currentId } = this.state;
        const newData = data.map(item => {
            const index = item.title.indexOf(searchValue);
            const beforeStr = item.title.substr(0, index);
            const afterStr = item.title.substr(index + searchValue.length);
            const title = index > -1
                ? <span className={currentId == item.id ? styles.light : styles.normal} onClick={() => this.onChoose(item.id)}>
                    {beforeStr}
                    <span className={styles.siteTreeSearchValue}>{searchValue}</span>
                    {afterStr}  {item.membersCount || item.membersCount == 0 ? '(' + item.membersCount + ' 人)' : null}
                </span>
                : <span className={currentId == item.id ? styles.light : styles.normal} onClick={() => this.onChoose(item.id)}>{item.title} {item.membersCount || item.membersCount == 0 ? '(' + item.membersCount + ' 人)' : null}</span>
            const { parent, id, value, children, key } = item;
            if (item.children) {
                return { title, key, parent, id, value, children: this.highLight(item.children) };
            }
            return { title, key, parent, id, value };
        });
        return newData;
    }

    onSelect = (selectedKeys) => {
        const { onSelect, hasOnselect } = this.props;
        if (hasOnselect || selectedKeys.length == 0) {
            return;
        }
        this.setState({ currentId: selectedKeys[0] });
        onSelect && typeof onSelect == 'function' && onSelect(selectedKeys[0]);
    };

    onChoose = (selectedKeys) => {        
        const { onSelect, hasOnselect } = this.props;
        if (!hasOnselect) {
            return;
        }
        this.setState({ currentId: selectedKeys });
        onSelect && typeof onSelect == 'function' && onSelect(selectedKeys);
    };

    onCheck = (checkedKeys, info) => {
        const { onCheck } = this.props;
        onCheck && typeof onCheck == 'function' && onCheck(checkedKeys, info);
    };

    onChange = (value) => {
        console.log(value, '值=========');
    }

    render() {
        const { treeData, placeholder, addDepartment, showAddDepbtn, checkable, draggable, checkedKeys, defaultExpandedKeys } = this.props;
        const { expandedKeys, isEx } = this.state;

        return (
            <>
                <Search style={{ marginBottom: 8 }} placeholder={placeholder} onChange={this.handleSearch} />
                <Tree
                    onExpand={this.onExpand}
                    expandedKeys={isEx ? expandedKeys : expandedKeys.concat(defaultExpandedKeys)}
                    treeData={this.highLight(treeData)}
                    checkable={!!checkable}
                    checkedKeys={checkedKeys}
                    onSelect={this.onSelect}
                    onCheck={this.onCheck}
                    onChange={this.onChange}
                    draggable={draggable}
                />
                {showAddDepbtn && <Button type="primary" icon={<PlusOutlined />} onClick={addDepartment} style={{ marginTop: '20px' }}>增加部门</Button>}
            </>
        )
    }
}

export default SearchTree;
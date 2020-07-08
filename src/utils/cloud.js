import FILE_TYPE from '@/const/FILE_TYPE';

// 有父子关系的数组转变为树形结构
export const translatortoTree = (parents, children) => {
    parents.forEach(parent => {
        children.forEach((current, index) => {
            if (parent.id == current.parent) {
                typeof parent.children != 'undefined'
                    ? parent.children.push(current)
                    : parent.children = [current]

                let temp = JSON.parse(JSON.stringify(children));
                temp.splice(index, 1);
                translatortoTree([current], temp);
                return;
            } else if (parent.members && parent.id != current.parent) {  // 企业成员
                const newmembers = parent.members.map(item => {
                    const { userId, name, roleName, loginAccount } = item;

                    return {
                        value: userId,
                        key: userId,
                        title: name + "(" + loginAccount + ")",
                    }
                })
                typeof parent.children != 'undefined'
                    ? parent.children.concat(newmembers)
                    : parent.children = newmembers;
                return;
            }
        })
    })
    return parents;
}


// 带成员的组织树
export const formatterForMembers = (data, inGroup = true) => {
    const newData = data && data.map(item => {
        let { parentId, id, name, children, members } = item;

        let newMembers;
        if (members) {
            newMembers = members.map(ii => { return { ...ii, parentId: id, member: true } });
        }
        let key = id;
        if (item.member) { // 成员标识
            key = `member${id}`;
        }

        children = members ? newMembers.concat(children ? children : []) : children;

        return {
            parent: parentId,
            id,
            title: item.account ? `${name}(${item.account})` : name,
            key,
            value: key,
            children: formatterForMembers(children, inGroup = true),
        }
    })
    return newData;
}

// 纯组织部门树
export const formatterForTreeData = (data, unique = null) => {
    const newData = data && data.map(item => {
        let { parentId, id, name, children, membersCount } = item;
        let key = id;
        if (!!unique) {
            key = unique + id;
        }

        return {
            parent: parentId ? parentId : 0,
            id,
            title: name,
            key,
            value: key,
            membersCount,
            children: formatterForTreeData(children, unique),
        }
    })
    return newData;
}

// 菜单目录树
export const formatter = (data, disabled) => {
    const newData = data && data.map(item => {
        const { children, name, id } = item;
        let options = {
            title: name,
            id,
            key: id,
            value: id,
        }
        if (disabled) {
            return {
                ...options,
                disabled,
                children: children && children.length > 0 ? formatter(children, disabled) : [],
            }
        }
        return {
            ...options,
            children: children && children.length > 0 ? formatter(children) : [],
        };
    })
    return newData;
}

// 是否有路径参数


export const getFileId = (search, type) => {
    if (search == "")
        return false;
    let params = search.split('?')[1];
    let strArr = params.split('&');
    for(let i of strArr) {
        let string = i.split('=')[0];
        let value = i.split('=')[1];
        if(string == type) {
            return value;
        }
    }
}


// 文件0按时间和类型倒序排列
export const sortByTimeAndType = (fileInfoList) => {
    let newfileInfoList = fileInfoList.sort((a, b) => {
        let bTime = b.mtime ? b.mtime : b.ctime;
        bTime = new Date(bTime).getTime();
        let aTime = a.mtime ? a.mtime : a.ctime;
        aTime = new Date(aTime).getTime();
        return bTime - aTime;
    });
    
    let folderList = newfileInfoList.filter(v => v.type == FILE_TYPE.FOLDER);
    let filesList = newfileInfoList.filter(v => v.type != FILE_TYPE.FOLDER);
    let newFilesList = folderList.concat(filesList);
    return newFilesList;
}

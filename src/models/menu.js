import { getMenusConfig } from '@/services/menu';
import { isUrl } from "@/utils/utils";

function formatter(data, parentPath = '/', parentAuthority) {
    return data.map(item => {
        let { path } = item;
        if(!isUrl(path)) {
            path = item.path + parentPath;
        }
        const result = {
            ...item,
            authority: item.authority || parentAuthority,
        }
        if(item.children) {
            result.children = formatter(item.children,`${parentPath}${item.path}/`, item.authority);
        }
        return result;
    })
}

const MenuModels = {
    namespace: 'menus',
    state: {
        menusData: [],
    },
    effects: {
        *fetchMenu({ payload, callback }, { call, put }) {
            const res = yield call(getMenusConfig, payload);
            // const response = formatter(res.data[0].children);
            yield put({
                type: 'save',
                payload: res.data,
            });
            callback && typeof callback == 'function' && callback(res);
        },
        *clear({ payload, callback }, { call, put }) {
            yield put({
                type: 'save',
                payload: [],
            });
        },
    },
    reducers: {
        save(state, { payload }) {
            return {
              ...state,
              menusData: payload, 
            }
        }
    }
}

export default MenuModels;


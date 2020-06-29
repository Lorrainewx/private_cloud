const _fileTypeList = [
    ['pdf', 'cloud', 'eio'],
    ['doc|docx|dot|dotx|docm|dotm', 'ppt|pptx|pot|potx|ppsx|pps|pptm|potm|ppsm|thmx|ppam|ppa',
        'xlsx|xls|xlt|xltx|csv|xlsb|xlsm|xltm|xml|xlam|xla|prn|dif|slk', 'vsd', 'mpp'
    ],
    ["key", "pages", "numbers", 'wps|wpt', 'dps|dpt', 'et|eet', 'flow'],
    ['ps|psd', 'XFL|indd', 'sketch'],
    ['dxf|dws|dwt|dwg'],
    ['3ds|max|skp|3MF|PLY|OBJ|FBX|STL|glTF|dae'],
    ['txt|rtf|epub|md'],
    ['asp|php|net|jsp|html|htm|js|css'],
    ['pns|tga|ico|icns|wbmp|rle|dib|jpf|jps|jpe|PCX|pxr|pod|pxr|hdr|iff|raw|pbm|sct|pic|pict|pct|wmf|pdd|cgm|mpo|emf|bmp|pcm|tif|tiff|gif|jpeg|jpg|png'
    ],
    ['ai|cdr|eps|svg'],
    ['x3f|mrw|chm|crw|pef|nef|dng|cr2|arw'],
    ['m4v|webm|3gp|3gpp|wmv|rm|asf|mpeg|mpg|m2ts|mp4|avi|mov|mkv|flv|f4v|swf|rmvb|mts'],
    ['cd|wav|mp3|midi|wma|amr|ape|flac|aac'],
    ['', 'rar|zip|tar.gz|tar|7z'],
    ['', 'Eml|Mime|Msg|Pst', 'TTF|OTF', 'apk', 'dmg', 'fla', 'ae', '', 'sai']
];
const getPositionForExt = ext => {
    ext = ext.toLowerCase();
    let width = 34;
    let height = 34;
    let initX = -27,
        initY = -2;
    let y = -1;
    let x = -1;
    let fileTypeList = _fileTypeList;
    for (let i = 0; i < fileTypeList.length; i++) {
        let fileRow = fileTypeList[i];
        x = -1;
        for (var j = 0; j < fileRow.length; j++) {
            var types = fileRow[j].split('|');
            var res = types.some(function (type) {
                if (type === ext) {
                    return true;
                };
            });
            if (res) {
                x = j;
                break;
            }
        };
        if (x != -1) {
            y = i;
            break;
        };
    };

    if (y != -1) {
        x = initX - x * width
        y = initY - y * height
    } else {  // 无此文件的icon图标 第一排第二个 默认cloud云图标
        x = initX - 1 * width;
        y = initY;
    }
    return { x: x, y: y };
}
const getPositionForFileName = name => {
    name = name.trim();
    var ext = name.split('.').pop();
    return getPositionForExt(ext);
}
const getIconPositionForFolder = fileInfo => {
    let width = 34;
    let height = 34;
    let initX = -27,
        initY = -1;
    let pos = {};
    // if (fileInfo.isTeamFolder) {  // 团队文件
    //     return {
    //         x: initX - 1 * width,
    //         y: initY - 16 * height
    //     }
    // } else if (fileInfo.isManuscriptBox()) {
    //     return {
    //         x: initX - 7 * width,
    //         y: initY - 16 * height
    //     }
    // } else if (fileInfo.isDepartmentFolder()) {
    //     return {
    //         x: initX - 6 * width,
    //         y: initY - 16 * height
    //     }
    // } else if (fileInfo.isSharing) {
    //     return {
    //         x: initX + 0,
    //         y: initY - 16 * height
    //     }
    // } else if (fileInfo.isEpPublicFolder()) {
    //     return {
    //         x: initX - 8 * width,
    //         y: initY - 16 * height
    //     }
    // } else {
    //     return {
    //         x: initX + 0,
    //         y: initY - 16 * height
    //     };
    // }
    return {
        x: initX + 0,
        y: initY - 16 * height
    };
}
const getIconPositionForFilInfo = (fileInfo) => {
    if (!fileInfo) {
        return null;
    };
    fileInfo = fileInfo;
    if (fileInfo.type == 2) {   // 文件夹
        return getIconPositionForFolder(fileInfo);
    } else {
        var fileName = fileInfo.fileName;
        return getPositionForFileName(fileName);
    }
}

const FileTypeIconMap = {};
FileTypeIconMap.getPositionForExt = getPositionForExt;
FileTypeIconMap.getPositionForFileName = getPositionForFileName;
FileTypeIconMap.getIconPositionForFolder = getIconPositionForFolder;
FileTypeIconMap.getIconPositionForFilInfo = getIconPositionForFilInfo;

export default FileTypeIconMap;

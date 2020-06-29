const FILE_ACTION_BITS = {
    READ: 1, //---------------------- 0
    COMMENT_READ: 2, //----------------- 1
    WRITE: 4, //------------------------ 2
    SHARE: 8, //------------------------ 3
    MOVE: 16, //------------------------ 4
    DOWNLOAD: 32, //-------------------- 5
    COPY: 64, //------------------------ 6
    STICK_TO_TOP: 128, //-------------- 7
    DELETE: 256, //-------------------- 8
    RENAME: 512, //-------------------- 9
    UPLOAD: 1024, //-------------------- 10
    UPLOADVERSION: 2048, //-----------  11
    LIST_ALL_VERSION: 4096, //--------- 12
    SET_CURRENT_VERSION: 8192, //------ 13
    LEAVE: 16384, //-----------------  14
    COMMENT_CREATE: Math.pow(2, 15),
    COMMENT_DEL: Math.pow(2, 16),
    COMMENT_FINISH: Math.pow(2, 17),
    TAG: Math.pow(2, 18),
    LOG: Math.pow(2, 19),
    ONLY_UPLOAD: Math.pow(2, 20),
    START_EVALUATION: Math.pow(2, 21),
    UNLOCK: Math.pow(2, 22),
    MANAGE_FILE_PERMISSION: Math.pow(2, 23),
    PRINT: Math.pow(2, 24),
    MANAGE_SECRET: Math.pow(2, 25)
}

export default FILE_ACTION_BITS;

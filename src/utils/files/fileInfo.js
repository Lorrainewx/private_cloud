import FILE_TYPE from '@/const/FILE_TYPE';
import FILE_ACTION_BITS from "@/const/FILE_ACTION_BITS";

const yzFile={
  'actions': -1,
  "thumbnailPath": null, // 缩略图地址
  "fileId": "0",
  "fileName": "",
  "type": FILE_TYPE.FILE,
  "fileType": 0,
  "ctime": 0, //距离1970的秒数

  "creatorId": 0,
  "creatorName": '',
  "ownerId": 0,
  "ownerName": '',

  "subChildNum": 0, // 如果是文件夹，则此值表示文件夹中含有的文件个数

  "latestVer": 0, // 如果此值大于零则表示有多个版本
  "currentVersion": 0, // 当前版本，一般情况下此值和 latestVer 相等

  "mtime": 0,
  "lastModifyUserId": 0,
  "lastModifyUserName": '',

  "shareAll": 0,
  // currently missing in API
  "isSharing": 0,
  "shareTime": 0,
  'isInviteSharing': 0,
  "fileSize": 10000, // byte
  "parentId": "0",

  // client side bussiness flow flag
  "inOtherPersonSharingFolder": false,

  "delTime": 0,
  "permission": 0,
  "accessCount": 0,
  "commentCount": 0,
  "unreadedCommentCount": 0,

  "unreadFileCount": 0, //for folder:the number of unread files; for file:unread mark
  "currentVerCommitterId": 0,
  "versionList": null,

  'teamMark': 0,
  "teamInfo": null,
  "sharerId": 0,
  "sharerName": "nobody",
  "belongTeam": 0, // 是否属于某个 team？
  "belongDepartment": 0, // 是否属于某个 部门？
  "userBelongToTeam": 0,
  "inTrash": false,
  "stickontop": 0,
  "starmark": 0,

  "fileStatus": -1,         // 0 is OK
  "currentVersionSize": 0,

  "enterpriseId": '',

  /**
   * 0 链接共享关闭
   * 1 链接共享打开
   * 2. 默认值
   */
  "newShareAll": 2,

  "praiseArray": [],
  "tagArray": [],

  "fileReviewCount": 0,

  //
  // UI state
  //
  'canPraise': true,
  'canAddTag': true,
  'canDelTag': true,
  'linkedFileId': 0,
  'linkedFileInfo': null,
  'linkedFileExt': 'txt',

  'isFocusFile': false,
  'focusCount': 0,
  'linkShareExpireTime': null,

  'evaluationStatus': 0,
  'evaluationFlowId': null,
  'openCount': 0,
  'accessUserCount': 0,
  'downloadCount': 0,
  'sendAccessInfoToLinkedIn': 0,

  'manuscriptBoxMark': 0,
  'comment': '',
  'endtime': new Date().getTime() / 1000,


  'lockedByUser': 0,
  'lockedByUserName': 'abc',
  'enterprisePub': 0,
  'openWatermark': -1,
  'recentType': -1,
  'pdfPassword': "asdfgh",
  'secretLevelId': -1,
  'secrectList': [],
  'loadedSectlist': false,
  'belongEnterprisePub': 0,

  get(key){
    return this[key];
  },
  //文件基本信息
  getFileId(){
    return this.get('fileId');
  },
  getParentId(){
    return this.get('parentId');
  },
  getFileName(){
    return this.get('fileName');
  },
  //获取文件后缀
  getFileExtension() {
    let extension = "";
    let name = this.getFileName() || "";
    if (!this.isFolder()) {
      let dotIndex = name.lastIndexOf('.');
      if (dotIndex >= 0) {
        extension = name.substring(dotIndex + 1);
      }
    }
    return extension;
  },
  getLowerCaseExt() {
    return this.getFileExtension().toLowerCase();
  },
  getFileStatus() {
    return this.get('fileStatus');
  },
  getOwnerId(){
    return this.get('ownerId');
  },
  getOwnerName: function () {
    return this.get('ownerName');
  },
  getTeamInfo() {
    return this.get('teamInfo');
  },
  getSharerId() {
    return this.get("sharerId");
  },
  getSharerName() {
    return this.get("sharerName");
  },
  //文件判断
  isFolder(){
    return this.get('type')==FILE_TYPE.FOLDER;
  },
  isEpPublicFolder(){
    return this.get('enterprisePub');
  },
  isLinkedFile(){
    return this.get('linkedFileId') != 0 && this.getFileId() != 0;
  },
  isTeamFolder(){
    return this.get('teamMark')==1;
  },
  isDepartmentFolder(){
    return this.get('teamMark')==2;
  },
  isManuscriptBox(){
    return this.get('manuscriptBoxMark')!=0 && this.isFolder();
  },
  isApplication() {
    return this.get('sourceType')=='application';
  },
  isApplicationPdf() {
    return this.get('sourceType')=='application.pdf';
  },
  isReady() {
    let status = this.getFileStatus();
    return status != 2;
  },
  belongsToTeam() {
    let inTeam = this.get('belongTeam');
    return inTeam;
  },
  isOwner() {
    let ownerId = this.get('ownerId');
    let createId = this.get('creatorId');
    let curUserId = JSON.parse(localStorage.getItem('user'));
    return ownerId.toString() === curUserId||(this.belongsToTeam()&&createId.toString()===curUserId);
  },
  isSharer() {
    return this.getSharerId().toString()  == localStorage.getItem('user').userId;
  },
  isSharings() {
    return this.get("isSharing") == true;
  },
  isOtherPersonSharingFile: function () {
    return this.isSharings() && !this.isOwner();
  },
  isTimeExpired() {
    let teamInfo = this.getTeamInfo();
    if (this.isTeamFolder() && teamInfo) {
      let today = new Date();
      return teamInfo.calculateRemainDay(today) == 0;
    };
    return false;
  },
  //是否可编辑
  isEditableOnLineFile(){
    let officeFiles = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    // let textFiles = ['md', 'js', 'java', 'php', 'hpp', 'cpp', 'jsp', 'php', 'css', 'scss', 'xml', 'c', 'h', 'm', 'mm'];
    let ext = this.getLowerCaseExt();
    let local1 = officeFiles.includes(ext);
    // let local2 = textFiles.includes(ext);
    return local1;
  },
  //是否可预览
  isDcsSupportFile() {  //'eio',
    const dcsSupportFiles = ["doc", "docx", "xls", "xlsx", "xlt", "ppt", "pptx", "eio", "pdf", "txt", "js", "html", "htm", "rtf", "md", "jsp", "css", "sql", "jpg", "jpeg", "png", "bmp", "gif", "wps", "dps", "et", "Zip", "rar", "zip", "tar", "7z", "gz", "eit"];
    return dcsSupportFiles.includes(this.getLowerCaseExt());
  },
  // 其他可预览格式
  isOtherSupportFile() {
    const files = ['3gpp', 'm2ts', 'f4v', 'mpeg', 'rm', '3gp', 'wmv', 'm4v', 'mp4', 'asf'];
    return files.includes(this.getLowerCaseExt());
  },
  isFileLocked() {
  return this.get('lockedByUser') != '0';
  },
  isFileLockedByMe() {
    return this.get('lockedByUser') == JSON.parse(localStorage.getItem('user')).userId;
  },
  isBelongApplicationPDF() {
    return this.get('belongApplicationPDF') == 1;
  },
  canUnlock() {
    return !!(this.get("actions") & FILE_ACTION_BITS.UNLOCK);
  },
  canUploadVersion() {
    if (!this.isReady()) {
      return false;
    }
    if (this.isFolder() || this.isLinkedFile()) {
      return false;
    }
    return !!(this.get("actions") & FILE_ACTION_BITS.UPLOADVERSION);
  },
  canUpload(){
    if (!this.belongsToTeam() && this.isOwner()) {
      return true;
    } else {
      let canUploadAction = !!(this.get("actions") & FILE_ACTION_BITS.UPLOAD);
      return canUploadAction;
    }
  },
  //是否可分享
  canShare() {
    if (this.getFileId() == 0) {
      return false;
    };
    if (this.isTeamFolder() || this.isDepartmentFolder() || this.isEpPublicFolder() || this.isManuscriptBox()) {
      return false;
    };
    return true;
  },
  //是否可复制
  canCopy() {
    if (this.getFileId() == 0) {
      return false;
    };
    if (!this.isReady()) {
      return false;
    };
    if (this.isTeamFolder()) {
      return false;
    }
    if (!this.belongsToTeam() && this.isOwner()) {
      return true;
    } else {
      return !!(this.get("actions") & FILE_ACTION_BITS.COPY);
    }
  },
  // 4 move
  canMove() {
    if (this.getFileId() == 0) {
      return false;
    };
    if (!this.isReady()) {
      return false;
    }
    return !!(this.get("actions") & FILE_ACTION_BITS.MOVE);
  },
  //是否可重命名
  canRename(){
    if (this.getFileId() == 0) {
      return false;
    };

    if (!this.isReady()) {
      return false;
    }
    if (this.isTeamFolder() || this.isTimeExpired() || this.isDepartmentFolder()) {
      return false;
    }
    if (!this.belongsToTeam() && this.isOwner()) {
      return true;
    } else {
      return !!(this.get("actions") & FILE_ACTION_BITS.RENAME);
    }
  },
  //是否可删除
  canDelete() {
    if (this.getFileId() == 0) {
      return false;
    }
    if (this.isEpPublicFolder() || this.isDepartmentFolder()) {
      return false;
    }
    return !!(this.get("actions") & FILE_ACTION_BITS.DELETE);
  },
  canLeaveShare() {
    if (this.isDepartmentFolder()) {
      return false;
    };
    return !!(this.get("actions") & FILE_ACTION_BITS.LEAVE);
  },
//  是否在我的收藏中
  inMyFavorite(){
    return this.get('imMyFavorite')
  }
}

export default function YZFile(file, props) {
  const fileInfo={
    ...yzFile,
    ...file,
    ...props,
  }
  return fileInfo;
}
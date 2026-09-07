const { ensureAdminLogin } = require('../../utils/api');
const i18n = require('../../utils/i18n');

const MAX_FILES = 9;
const LOCAL_SAMPLE_ASSETS = [
  {
    label: '001.jpg',
    packagePath: '/nails_picture/001.jpg',
    cloudPath: 'nails_picture/001.jpg'
  },
  {
    label: 'back.jpg',
    packagePath: '/nails_picture/back.jpg',
    cloudPath: 'nails_picture/back.jpg'
  }
];

function copyToUserFile(packagePath, fileName) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    const destPath = `${wx.env.USER_DATA_PATH}/nailshop-${Date.now()}-${fileName}`;
    fs.copyFile({
      srcPath: packagePath,
      destPath,
      success: () => resolve(destPath),
      fail: reject
    });
  });
}

function pad2(value) {
  return value < 10 ? `0${value}` : String(value);
}

function randomString(length) {
  let result = '';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let index = 0; index < length; index += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function fileExtension(tempFile) {
  const filePath = tempFile && tempFile.tempFilePath;
  const match = /\.[a-zA-Z0-9]+$/.exec(filePath || '');
  if (match) return match[0].slice(1).toLowerCase();
  return tempFile && tempFile.fileType === 'video' ? 'mp4' : 'jpg';
}

function isVideoFile(tempFile) {
  if (tempFile.fileType === 'video') return true;
  const ext = fileExtension(tempFile);
  return ['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm'].includes(ext);
}

function todayFolder() {
  const date = new Date();
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate())
  ].join('');
}

Page({
  data: {
    uploading: false,
    uploadedItems: [],
    hasLocalSamples: false,
    lang: i18n.getLanguage(),
    i18n: i18n.getMessages(i18n.getLanguage())
  },

  onLoad() {
    if (!ensureAdminLogin()) return;
    this.applyLanguage();
    this.checkLocalSamples();
  },

  applyLanguage() {
    const lang = i18n.getLanguage();
    this.setData({
      lang,
      i18n: i18n.getMessages(lang)
    });
    wx.setNavigationBarTitle({
      title: i18n.getMessage(lang, 'adminMedia.title')
    });
  },

  checkLocalSamples() {
    const fs = wx.getFileSystemManager();
    const allExist = LOCAL_SAMPLE_ASSETS.every((item) => {
      try {
        fs.accessSync(item.packagePath);
        return true;
      } catch (error) {
        return false;
      }
    });
    this.setData({ hasLocalSamples: allExist });
  },

  async migrateLocalSamples() {
    if (this.data.uploading) return;

    this.setData({ uploading: true });
    wx.showLoading({
      title: i18n.getMessage(i18n.getLanguage(), 'adminMedia.uploading'),
      mask: true
    });

    const uploaded = [];
    try {
      for (const asset of LOCAL_SAMPLE_ASSETS) {
        const userPath = await copyToUserFile(asset.packagePath, asset.label);
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: asset.cloudPath,
          filePath: userPath
        });
        uploaded.push({
          fileID: uploadRes.fileID,
          type: 'image',
          label: asset.label
        });
      }
      wx.hideLoading();
      this.setData({
        uploading: false,
        hasLocalSamples: false,
        uploadedItems: this.data.uploadedItems.concat(uploaded)
      });
      wx.showToast({
        title: i18n.getMessage(i18n.getLanguage(), 'adminMedia.uploaded'),
        icon: 'success'
      });
    } catch (error) {
      wx.hideLoading();
      this.setData({ uploading: false });
      wx.showToast({
        title:
          (error && error.errMsg) ||
          i18n.getMessage(i18n.getLanguage(), 'adminMedia.migrateFailed'),
        icon: 'none'
      });
    }
  },

  async chooseAndUpload() {
    if (this.data.uploading) return;

    let mediaRes;
    try {
      mediaRes = await wx.chooseMedia({
        count: MAX_FILES,
        mediaType: ['image', 'video'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        maxDuration: 60
      });
    } catch (error) {
      wx.showToast({
        title: i18n.getMessage(i18n.getLanguage(), 'adminMedia.chooseFailed'),
        icon: 'none'
      });
      return;
    }

    const tempFiles = mediaRes.tempFiles || [];
    if (!tempFiles.length) return;

    this.setData({ uploading: true });
    wx.showLoading({
      title: i18n.getMessage(i18n.getLanguage(), 'adminMedia.uploading'),
      mask: true
    });

    const uploaded = [];
    try {
      const folder = `nails_assets/${todayFolder()}`;
      for (let index = 0; index < tempFiles.length; index += 1) {
        const tempFile = tempFiles[index];
        const ext = fileExtension(tempFile);
        const cloudPath =
          `${folder}/${Date.now()}-${randomString(6)}-${index}.${ext}`;
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFile.tempFilePath
        });
        uploaded.push({
          fileID: uploadRes.fileID,
          type: isVideoFile(tempFile) ? 'video' : 'image'
        });
      }
      wx.hideLoading();
      this.setData({
        uploading: false,
        uploadedItems: this.data.uploadedItems.concat(uploaded)
      });
      wx.showToast({
        title: i18n.getMessage(i18n.getLanguage(), 'adminMedia.uploaded'),
        icon: 'success'
      });
    } catch (error) {
      wx.hideLoading();
      this.setData({ uploading: false });
      wx.showToast({
        title:
          (error && error.errMsg) ||
          i18n.getMessage(i18n.getLanguage(), 'adminMedia.uploadFailed'),
        icon: 'none'
      });
    }
  },

  copyFileID(event) {
    const fileID = event.currentTarget.dataset.fileid;
    if (!fileID) return;
    wx.setClipboardData({
      data: fileID,
      success: () => {
        wx.showToast({
          title: i18n.getMessage(i18n.getLanguage(), 'adminMedia.copied'),
          icon: 'success'
        });
      }
    });
  }
});

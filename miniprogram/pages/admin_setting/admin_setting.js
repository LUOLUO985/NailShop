const { callAction, callAdminAction, ensureAdminLogin } = require('../../utils/api');
const i18n = require('../../utils/i18n');
const { resolveFileIDs, resolveUrl } = require('../../utils/cloudMedia');

Page({
  data: {
    loading: true,
    qrFileID: '',
    qrSrc: '',
    uploading: false,
    lang: i18n.getLanguage(),
    i18n: i18n.getMessages(i18n.getLanguage())
  },

  onLoad() {
    if (!ensureAdminLogin()) return;
    this.applyLanguage();
    this.loadQr();
  },

  applyLanguage() {
    const lang = i18n.getLanguage();
    this.setData({
      lang,
      i18n: i18n.getMessages(lang)
    });
    wx.setNavigationBarTitle({
      title: lang === 'en' ? 'Settings' : '后台设置'
    });
  },

  async applyQr(fileID) {
    const value = fileID || '';
    if (value) {
      await resolveFileIDs([value]);
    }
    this.setData({
      qrFileID: value,
      qrSrc: value ? resolveUrl(value) : ''
    });
  },

  async loadQr() {
    this.setData({ loading: true });
    try {
      const data = await callAction('getQr');
      await this.applyQr(data.fileID || '');
      this.setData({ loading: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({
        title:
          error.message ||
          i18n.getMessage(i18n.getLanguage(), 'adminSetting.loadFailed'),
        icon: 'none'
      });
    }
  },

  async chooseQr() {
    if (this.data.uploading) return;
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      const tempFilePath = res.tempFiles && res.tempFiles[0]
        ? res.tempFiles[0].tempFilePath
        : '';
      if (!tempFilePath) return;

      const match = /\.([a-zA-Z0-9]+)$/.exec(tempFilePath);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const cloudPath = `qrcode/wechat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      this.setData({ uploading: true });
      wx.showLoading({
        title: i18n.getMessage(i18n.getLanguage(), 'adminSetting.uploading'),
        mask: true
      });
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      });
      const fileID = uploadRes.fileID;
      await callAdminAction('adminSaveQr', { fileID });
      wx.hideLoading();
      await this.applyQr(fileID);
      this.setData({ uploading: false });
      wx.showToast({
        title: i18n.getMessage(i18n.getLanguage(), 'adminSetting.saved'),
        icon: 'success'
      });
    } catch (error) {
      wx.hideLoading();
      this.setData({ uploading: false });
      wx.showToast({
        title:
          error.message ||
          i18n.getMessage(i18n.getLanguage(), 'adminSetting.uploadFailed'),
        icon: 'none'
      });
    }
  }
});

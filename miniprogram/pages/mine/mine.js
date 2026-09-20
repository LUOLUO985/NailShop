const i18n = require('../../utils/i18n');
const notifications = require('../../data/notifications');
const share = require('../../utils/share');

Page({
  data: {
    lang: i18n.getLanguage(),
    i18n: i18n.getMessages(i18n.getLanguage()),
    notifications
  },

  onShow() {
    share.enableShareMenu();
    this.applyLanguage();
  },

  applyLanguage() {
    const lang = i18n.getLanguage();
    this.setData({
      lang,
      i18n: i18n.getMessages(lang)
    });
    wx.setNavigationBarTitle({
      title: i18n.getMessage(lang, 'notifications.title')
    });
  },

  // 通知页本身没有可分享的内容，转发时分享店铺首页
  onShareAppMessage() {
    return share.homeShare(this.data.lang);
  }
});

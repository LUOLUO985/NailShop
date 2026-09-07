const { callAction, hasAdminSession, clearAdminSession } = require('../../utils/api');
const { adminPasswordStorageKey } = require('../../config');
const i18n = require('../../utils/i18n');

Page({
  data: {
    loggedIn: false,
    password: '',
    loggingIn: false,
    lang: i18n.getLanguage(),
    i18n: i18n.getMessages(i18n.getLanguage())
  },

  onShow() {
    this.applyLanguage();
    this.setData({ loggedIn: hasAdminSession() });
  },

  applyLanguage() {
    const lang = i18n.getLanguage();
    this.setData({
      lang,
      i18n: i18n.getMessages(lang)
    });
    wx.setNavigationBarTitle({
      title: lang === 'en' ? 'Mine' : '我的'
    });
  },

  toggleLanguage() {
    const next = this.data.lang === 'zh' ? 'en' : 'zh';
    i18n.setLanguage(next);
    this.applyLanguage();
  },

  onPasswordInput(event) {
    this.setData({ password: event.detail.value });
  },

  async login() {
    const password = this.data.password.trim();
    if (!password) {
      const lang = i18n.getLanguage();
      wx.showToast({
        title: i18n.getMessage(lang, 'mine.enterPassword'),
        icon: 'none'
      });
      return;
    }
    if (this.data.loggingIn) return;

    this.setData({ loggingIn: true });
    wx.showLoading({
      title: i18n.getMessage(this.data.lang, 'mine.verifying'),
      mask: true
    });
    try {
      await callAction('login', { password });
      wx.setStorageSync(adminPasswordStorageKey, password);
      wx.hideLoading();
      this.setData({ loggedIn: true, loggingIn: false });
      wx.showToast({
        title: i18n.getMessage(this.data.lang, 'mine.loginSuccess'),
        icon: 'success'
      });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/admin_goods/admin_goods' });
      }, 500);
    } catch (error) {
      wx.hideLoading();
      this.setData({ loggingIn: false });
      wx.showToast({
        title:
          error.message ||
          i18n.getMessage(i18n.getLanguage(), 'mine.loginFailed'),
        icon: 'none'
      });
    }
  },

  goGoods() {
    wx.navigateTo({ url: '/pages/admin_goods/admin_goods' });
  },

  goSetting() {
    wx.navigateTo({ url: '/pages/admin_setting/admin_setting' });
  },

  goMedia() {
    wx.navigateTo({ url: '/pages/admin_media/admin_media' });
  },

  logout() {
    wx.showModal({
      title: i18n.getMessage(this.data.lang, 'mine.logoutTitle'),
      content: i18n.getMessage(this.data.lang, 'mine.logoutConfirm'),
      success: (res) => {
        if (!res.confirm) return;
        clearAdminSession();
        this.setData({ loggedIn: false, password: '' });
        wx.showToast({
          title: i18n.getMessage(this.data.lang, 'mine.logoutSuccess'),
          icon: 'none'
        });
      }
    });
  }
});

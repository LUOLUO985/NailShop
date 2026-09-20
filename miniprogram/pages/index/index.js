const catalog = require('../../nails_picture/products');
const accessories = require('../../nails_picture/accessories');
const demo = require('../../data/demo');
const { decorateProduct } = require('../../utils/format');
const i18n = require('../../utils/i18n');
const { resolveFileIDs, resolveUrl } = require('../../utils/cloudMedia');
const share = require('../../utils/share');

Page({
  data: {
    shopName: catalog.shopName,
    heroImage: catalog.heroImage,
    demoVideo: demo.videoFileID || '',
    lang: i18n.getLanguage(),
    i18n: i18n.getMessages(i18n.getLanguage()),
    langSwitchText: i18n.languageSwitchText(i18n.getLanguage()),
    singlePageMode: false,
    activeCategory: 'styles',
    styleProducts: [],
    accessoryProducts: []
  },

  onLoad() {
    // 打开右上角菜单的「发送给朋友 / 分享到朋友圈」入口
    share.enableShareMenu();
    this.setData({ singlePageMode: share.isSinglePageMode() });
  },

  onShow() {
    this.applyLanguage();
    this.loadCatalog();
  },

  applyLanguage() {
    const lang = i18n.getLanguage();
    this.setData({
      lang,
      i18n: i18n.getMessages(lang),
      langSwitchText: i18n.languageSwitchText(lang)
    });
  },

  toggleLanguage() {
    const next = this.data.lang === 'zh' ? 'en' : 'zh';
    i18n.setLanguage(next);
    this.applyLanguage();
    this.loadCatalog();
  },

  decorateList(list) {
    const lang = i18n.getLanguage();
    return (list || [])
      .filter((item) => item.isOnSale !== false)
      .map((item) =>
        i18n.localizeProduct(
          decorateProduct({
            ...item,
            _id: item.code
          }),
          lang
        )
      );
  },

  async loadCatalog() {
    const styleProducts = this.decorateList(catalog.products);
    const accessoryProducts = this.decorateList(accessories);
    const fileIDs = [catalog.heroImage, demo.videoFileID || ''].concat(
      styleProducts.map((item) => item.cover),
      accessoryProducts.map((item) => item.cover)
    );

    // 先把所有 cloud:// 文件 ID 批量换成可展示的 https 链接，再一次性渲染，
    // 避免安卓端把 cloud:// 直接交给 <image> 后显示灰块。
    await resolveFileIDs(fileIDs);

    this.setData({
      shopName: catalog.shopName,
      heroImage: resolveUrl(catalog.heroImage),
      demoVideo: resolveUrl(demo.videoFileID || ''),
      styleProducts: styleProducts.map((item) => ({
        ...item,
        cover: resolveUrl(item.cover)
      })),
      accessoryProducts: accessoryProducts.map((item) => ({
        ...item,
        cover: resolveUrl(item.cover)
      }))
    });
    if (this._pulling) {
      wx.stopPullDownRefresh();
      this._pulling = false;
    }
  },

  switchCategory(event) {
    const category = event.currentTarget.dataset.category;
    if (category === 'accessories') {
      this.setData({ activeCategory: 'accessories' });
    } else if (category === 'video') {
      this.setData({ activeCategory: 'video' });
    } else {
      this.setData({ activeCategory: 'styles' });
    }
  },

  onPullDownRefresh() {
    this._pulling = true;
    this.loadCatalog();
  },

  goDetail(event) {
    const code = event.currentTarget.dataset.code;
    if (!code) return;
    // 朋友圈单页模式下不允许跳转页面，提示用户前往完整小程序
    if (this.data.singlePageMode) {
      wx.showToast({
        title: i18n.getMessage(this.data.lang, 'share.singlePageHint'),
        icon: 'none',
        duration: 3000
      });
      return;
    }
    wx.navigateTo({ url: `/pages/detail/detail?code=${code}` });
  },

  onShareAppMessage() {
    return share.homeShare(this.data.lang, this.data.heroImage);
  },

  onShareTimeline() {
    return share.homeTimeline(this.data.lang, this.data.heroImage);
  },

  onAddToFavorites() {
    return share.homeTimeline(this.data.lang, this.data.heroImage);
  }
});

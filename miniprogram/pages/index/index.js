const catalog = require('../../nails_picture/products');
const { decorateProduct } = require('../../utils/format');
const i18n = require('../../utils/i18n');

Page({
  data: {
    shopName: catalog.shopName,
    heroImage: catalog.heroImage,
    lang: i18n.getLanguage(),
    i18n: i18n.getMessages(i18n.getLanguage()),
    langSwitchText: i18n.languageSwitchText(i18n.getLanguage()),
    products: []
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

  loadCatalog() {
    const lang = i18n.getLanguage();
    const visibleProducts = (catalog.products || []).filter(
      (item) => item.isOnSale !== false
    );
    const products = visibleProducts.map((item) => {
      const decorated = decorateProduct({
        ...item,
        _id: item.code
      });
      return i18n.localizeProduct(decorated, lang);
    });
    this.setData({
      shopName: catalog.shopName,
      heroImage: catalog.heroImage,
      products
    });
    if (this._pulling) {
      wx.stopPullDownRefresh();
      this._pulling = false;
    }
  },

  onPullDownRefresh() {
    this._pulling = true;
    this.loadCatalog();
  },

  goDetail(event) {
    const code = event.currentTarget.dataset.code;
    if (!code) return;
    wx.navigateTo({ url: `/pages/detail/detail?code=${code}` });
  }
});

const { callAction } = require('../../utils/api');
const { decorateProduct } = require('../../utils/format');
const catalog = require('../../nails_picture/products');
const i18n = require('../../utils/i18n');

Page({
  data: {
    loading: true,
    loadError: false,
    errorText: '',
    lang: i18n.getLanguage(),
    i18n: i18n.getMessages(i18n.getLanguage()),
    product: null,
    qrFileID: '',
    qrLoadFailed: false
  },

  onLoad(options) {
    this.applyLanguage();
    this.productCode = options.code || '';
    this.productId = options.id || '';
    this.loadDetail();
  },

  applyLanguage() {
    const lang = i18n.getLanguage();
    this.setData({
      lang,
      i18n: i18n.getMessages(lang)
    });
    wx.setNavigationBarTitle({
      title: lang === 'en' ? 'Style Detail' : '款式详情'
    });
  },

  async loadDetail() {
    const localProduct = this.productCode
      ? catalog.findProductByCode(this.productCode)
      : null;

    if (localProduct && localProduct.isOnSale !== false) {
      await this.loadLocalProduct(localProduct);
      return;
    }

    if (!this.productId) {
      this.setData({
        loading: false,
        loadError: true,
        errorText: i18n.getMessage(i18n.getLanguage(), 'detail.notFound')
      });
      return;
    }

    this.setData({ loading: true, loadError: false });
    try {
      const data = await callAction('getDetail', { id: this.productId });
      const product = i18n.localizeProduct(
        decorateProduct(data.product || null),
        i18n.getLanguage()
      );
      this.setData({
        product,
        qrFileID: data.qrFileID || '',
        qrLoadFailed: false,
        loading: false
      });
    } catch (error) {
      this.setData({
        loading: false,
        loadError: true,
        errorText: error.message
      });
    }
  },

  async loadLocalProduct(localProduct) {
    this.setData({ loading: true, loadError: false });
    try {
      // 二维码配置仍然从云端读取；云函数没部署时不影响本地商品展示
      let qrFileID = '';
      try {
        const qrData = await callAction('getQr');
        qrFileID = (qrData && qrData.fileID) || '';
      } catch (error) {
        qrFileID = '';
      }
      const product = i18n.localizeProduct(
        decorateProduct({
          ...localProduct,
          _id: localProduct.code
        }),
        i18n.getLanguage()
      );
      this.setData({
        product,
        qrFileID,
        qrLoadFailed: false,
        loading: false
      });
    } catch (error) {
      this.setData({
        loading: false,
        loadError: true,
        errorText: error.message
      });
    }
  },

  onQrError() {
    this.setData({ qrLoadFailed: true });
  },

  onImageError(event) {
    const index = event.currentTarget.dataset.index;
    const product = this.data.product;
    if (!product) return;
    const images = product.images.slice();
    if (images[index]) {
      images[index] = '';
      this.setData({ 'product.images': images });
    }
  },

  onShareAppMessage() {
    const product = this.data.product || {};
    return {
      title: product.name
        ? `${product.name} ｜ 扫码联系我`
        : '墨痕Nails 穿戴甲',
      path: product.code
        ? `/pages/detail/detail?code=${product.code}`
        : '/pages/index/index'
    };
  }
});

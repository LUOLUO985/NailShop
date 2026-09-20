const { callAction } = require('../../utils/api');
const { decorateProduct } = require('../../utils/format');
const catalog = require('../../nails_picture/products');
const accessories = require('../../nails_picture/accessories');
const merchant = require('../../data/merchant');
const i18n = require('../../utils/i18n');
const share = require('../../utils/share');
const {
  resolveFileIDs,
  resolveMediaFields,
  resolveUrl
} = require('../../utils/cloudMedia');

Page({
  data: {
    loading: true,
    loadError: false,
    errorText: '',
    lang: i18n.getLanguage(),
    i18n: i18n.getMessages(i18n.getLanguage()),
    product: null,
    qrFileID: merchant.qrImage || '',
    qrLoadFailed: false,
    singlePageMode: false,
    wechatIds: merchant.wechatIds || []
  },

  onLoad(options) {
    // 打开右上角菜单的「发送给朋友 / 分享到朋友圈」入口
    share.enableShareMenu();
    this.singlePageMode = share.isSinglePageMode();
    this.applyLanguage();
    this.productCode = options.code || '';
    this.productId = options.id || '';
    this.setData({ singlePageMode: this.singlePageMode });
    this.loadDetail();
  },

  applyLanguage() {
    const lang = i18n.getLanguage();
    this.setData({
      lang,
      i18n: i18n.getMessages(lang)
    });
    // 单页模式（朋友圈打开）下导航栏由微信固定，不能自定义标题
    if (!this.singlePageMode) {
      wx.setNavigationBarTitle({
        title: lang === 'en' ? 'Style Detail' : '款式详情'
      });
    }
  },

  // 把商品图/视频/二维码的 cloud:// 文件 ID 换成 https 临时链接后再展示。
  async resolveDisplayData(product, qrFileID) {
    if (!product) return { product: null, qrFileID: qrFileID || '' };

    const resolvedProduct = await resolveMediaFields(product, [
      'images',
      'videos',
      'cover'
    ]);
    let resolvedQr = qrFileID || '';
    if (resolvedQr) {
      await resolveFileIDs([resolvedQr]);
      resolvedQr = resolveUrl(resolvedQr);
    }
    return { product: resolvedProduct, qrFileID: resolvedQr };
  },

  async loadDetail() {
    const localProduct = this.productCode
      ? catalog.findProductByCode(this.productCode) ||
        accessories.find(
          (item) => String(item.code) === String(this.productCode).trim()
        )
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
      const displayData = await this.resolveDisplayData(
        product,
        merchant.qrImage || data.qrFileID || ''
      );
      this.setData({
        product: displayData.product,
        qrFileID: displayData.qrFileID,
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
      let qrFileID = merchant.qrImage || '';
      if (!qrFileID) {
        try {
          const qrData = await callAction('getQr');
          qrFileID = (qrData && qrData.fileID) || '';
        } catch (error) {
          qrFileID = '';
        }
      }
      const product = i18n.localizeProduct(
        decorateProduct({
          ...localProduct,
          _id: localProduct.code
        }),
        i18n.getLanguage()
      );
      const displayData = await this.resolveDisplayData(product, qrFileID);
      this.setData({
        product: displayData.product,
        qrFileID: displayData.qrFileID,
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

  copyWechatId(event) {
    const id = event.currentTarget.dataset.id;
    if (!id) return;
    wx.setClipboardData({
      data: id,
      success: () => {
        wx.showToast({
          title: i18n.getMessage(i18n.getLanguage(), 'common.copied'),
          icon: 'success'
        });
      }
    });
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
    return share.productShare(this.data.product, {
      lang: this.data.lang,
      fallbackId: this.productId,
      imageUrl: this.shareImageUrl()
    });
  },

  onShareTimeline() {
    return share.productTimeline(this.data.product, {
      lang: this.data.lang,
      fallbackId: this.productId,
      imageUrl: this.shareImageUrl()
    });
  },

  onAddToFavorites() {
    return share.productFavorite(this.data.product, {
      lang: this.data.lang,
      fallbackId: this.productId,
      imageUrl: this.shareImageUrl()
    });
  },

  // 转发卡片配图：优先用页面里已解析好的 https 链接，否则退回 cloud:// 文件 ID
  shareImageUrl() {
    const product = this.data.product || {};
    return product.cover || (product.images && product.images[0]) || '';
  },

  backToHome() {
    if (this.data.singlePageMode) {
      wx.showToast({
        title: i18n.getMessage(this.data.lang, 'share.singlePageHint'),
        icon: 'none',
        duration: 3000
      });
      return;
    }
    wx.reLaunch({ url: '/pages/index/index' });
  }
});

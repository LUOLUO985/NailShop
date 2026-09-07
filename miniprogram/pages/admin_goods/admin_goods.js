const { callAdminAction, ensureAdminLogin } = require('../../utils/api');
const { decorateProduct } = require('../../utils/format');
const i18n = require('../../utils/i18n');

const MAX_IMAGES = 9;

Page({
  data: {
    loading: true,
    loadError: false,
    errorText: '',
    goods: [],
    modalVisible: false,
    saving: false,
    lang: i18n.getLanguage(),
    i18n: i18n.getMessages(i18n.getLanguage()),
    modalTitle: '',
    form: {
      id: '',
      name: '',
      price: '',
      stock: '',
      images: []
    }
  },

  onLoad() {
    if (!ensureAdminLogin()) return;
    this.applyLanguage();
    this.loadGoods();
  },

  applyLanguage() {
    const lang = i18n.getLanguage();
    this.setData({
      lang,
      i18n: i18n.getMessages(lang)
    });
    wx.setNavigationBarTitle({
      title: lang === 'en' ? 'Manage Products' : '商品管理'
    });
  },

  async loadGoods() {
    this.setData({ loading: true, loadError: false });
    try {
      const data = await callAdminAction('adminListProducts');
      const goods = (data.products || [])
        .map(decorateProduct)
        .filter(Boolean);
      this.setData({ goods, loading: false });
    } catch (error) {
      this.setData({
        loading: false,
        loadError: true,
        errorText: error.message
      });
    }
  },

  openCreate() {
    this.setData({
      modalVisible: true,
      modalTitle: i18n.getMessage(i18n.getLanguage(), 'adminGoods.newTitle'),
      form: { id: '', name: '', price: '', stock: '', images: [] }
    });
  },

  openEdit(event) {
    const id = event.currentTarget.dataset.id;
    const item = this.data.goods.find((goodsItem) => goodsItem._id === id);
    if (!item) return;
    this.setData({
      modalVisible: true,
      modalTitle: i18n.getMessage(i18n.getLanguage(), 'adminGoods.editTitle'),
      form: {
        id: item._id,
        name: item.name,
        price: String(item.price),
        stock: String(item.stock),
        images: (item.images || []).slice()
      }
    });
  },

  closeModal() {
    if (this.data.saving) return;
    this.setData({ modalVisible: false });
  },

  noop() {},

  onFieldInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  async chooseImages() {
    const remain = MAX_IMAGES - this.data.form.images.length;
    if (remain <= 0) {
      wx.showToast({
        title: i18n.getMessage(i18n.getLanguage(), 'adminGoods.maxImages'),
        icon: 'none'
      });
      return;
    }

    try {
      const res = await wx.chooseMedia({
        count: remain,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      const tempPaths = (res.tempFiles || []).map((file) => file.tempFilePath);
      if (!tempPaths.length) return;

      wx.showLoading({
        title: i18n.getMessage(i18n.getLanguage(), 'adminGoods.uploadingText'),
        mask: true
      });
      const uploaded = [];
      for (let index = 0; index < tempPaths.length; index += 1) {
        const tempPath = tempPaths[index];
        const match = /\.([a-zA-Z0-9]+)$/.exec(tempPath);
        const ext = match ? match[1].toLowerCase() : 'jpg';
        const cloudPath =
          `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${index}.${ext}`;
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempPath
        });
        uploaded.push(uploadRes.fileID);
      }
      wx.hideLoading();
      this.setData({
        'form.images': this.data.form.images.concat(uploaded)
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title:
          (error && error.errMsg) ||
          i18n.getMessage(i18n.getLanguage(), 'adminGoods.uploadFailed'),
        icon: 'none'
      });
    }
  },

  removeImage(event) {
    const index = event.currentTarget.dataset.index;
    const images = this.data.form.images.slice();
    images.splice(index, 1);
    this.setData({ 'form.images': images });
  },

  validateForm() {
    const form = this.data.form;
    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    const lang = i18n.getLanguage();
    if (!name) return i18n.getMessage(lang, 'adminGoods.errName');
    if (!Number.isFinite(price) || price < 0) {
      return i18n.getMessage(lang, 'adminGoods.errPrice');
    }
    if (!Number.isInteger(stock) || stock < 0) {
      return i18n.getMessage(lang, 'adminGoods.errStock');
    }
    if (!form.images.length) return i18n.getMessage(lang, 'adminGoods.errImages');
    return '';
  },

  async submitForm() {
    if (this.data.saving) return;
    const form = this.data.form;
    const errorText = this.validateForm();
    if (errorText) {
      wx.showToast({ title: errorText, icon: 'none' });
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images.slice()
    };

    this.setData({ saving: true });
    wx.showLoading({
      title: i18n.getMessage(i18n.getLanguage(), 'adminGoods.saveLoading'),
      mask: true
    });
    try {
      if (form.id) {
        await callAdminAction('adminUpdateProduct', { id: form.id, ...payload });
      } else {
        await callAdminAction('adminCreateProduct', payload);
      }
      wx.hideLoading();
      this.setData({ saving: false, modalVisible: false });
      wx.showToast({
        title: i18n.getMessage(i18n.getLanguage(), 'adminGoods.saveSuccess'),
        icon: 'success'
      });
      this.loadGoods();
    } catch (error) {
      wx.hideLoading();
      this.setData({ saving: false });
      wx.showToast({
        title:
          error.message ||
          i18n.getMessage(i18n.getLanguage(), 'adminGoods.saveFailed'),
        icon: 'none'
      });
    }
  },

  async toggleSale(event) {
    const id = event.currentTarget.dataset.id;
    wx.showLoading({
      title: i18n.getMessage(i18n.getLanguage(), 'adminGoods.processing'),
      mask: true
    });
    try {
      const data = await callAdminAction('adminToggleProduct', { id });
      wx.hideLoading();
      const item = decorateProduct(data.product || null);
      if (item) {
        const goods = this.data.goods.map((goodsItem) =>
          goodsItem._id === item._id ? item : goodsItem
        );
        this.setData({ goods });
      }
      wx.showToast({
        title: i18n.getMessage(
          i18n.getLanguage(),
          data.product && data.product.isOnSale ? 'adminGoods.onSale' : 'adminGoods.offSale'
        ),
        icon: 'none'
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title:
          error.message ||
          i18n.getMessage(i18n.getLanguage(), 'adminGoods.operationFailed'),
        icon: 'none'
      });
    }
  },

  deleteGoods(event) {
    const id = event.currentTarget.dataset.id;
    const name = event.currentTarget.dataset.name;
    const lang = i18n.getLanguage();
    const deleteContent = i18n
      .getMessage(lang, 'adminGoods.deleteContent')
      .replace('{name}', name);
    wx.showModal({
      title: i18n.getMessage(lang, 'adminGoods.deleteTitle'),
      content: deleteContent,
      confirmColor: '#c95a5a',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({
          title: i18n.getMessage(lang, 'adminGoods.deleting'),
          mask: true
        });
        try {
          await callAdminAction('adminDeleteProduct', { id });
          wx.hideLoading();
          this.setData({
            goods: this.data.goods.filter((item) => item._id !== id)
          });
          wx.showToast({
            title: i18n.getMessage(lang, 'adminGoods.deleted'),
            icon: 'success'
          });
        } catch (error) {
          wx.hideLoading();
          wx.showToast({
            title:
              error.message ||
              i18n.getMessage(lang, 'adminGoods.operationFailed'),
            icon: 'none'
          });
        }
      }
    });
  }
});

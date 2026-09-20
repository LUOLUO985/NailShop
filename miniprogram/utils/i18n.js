const STORAGE_KEY = 'nailshop_language';
const DEFAULT_LANGUAGE = 'zh';

const messages = {
  zh: {
    common: {
      loading: '正在加载…',
      retry: '重新加载',
      soldOut: '售罄',
      soldOutLabel: '已售罄',
      stockPrefix: '库存',
      codePrefix: '编号',
      size: '尺寸',
      copy: '复制',
      copied: '已复制',
      backHome: '看看其他款式'
    },
    share: {
      shopName: '墨痕Nails 穿戴甲',
      homeTitle: '墨痕Nails 穿戴甲｜扫码咨询下单',
      homeTimelineTitle: '墨痕Nails 穿戴甲｜新款持续更新',
      friendSuffix: '｜扫码咨询下单',
      timelineSuffix: '｜墨痕Nails 穿戴甲',
      detailButton: '把这款分享给好友',
      detailCardTitle: '喜欢这个款式？',
      timelineHint: '也可以点右上角「···」分享到朋友圈',
      singlePageHint: '正在浏览朋友圈分享页，点底部「前往小程序」可查看全部款式'
    },
    index: {
      heroSub: '手工制作 匠心之选',
      sectionTitle: '精选款式',
      categoryStyles: '精品款式',
      categoryAccessories: '配件',
      demoTitle: '使用演示',
      empty: '暂时没有上架的美甲，欢迎稍后再来看看'
    },
    detail: {
      soldTip: '该款式已售罄，可以扫码联系我咨询补货',
      contactTitle: '联系商家',
      qrLoadFailed: '二维码图片加载失败，请稍后重试或联系店主',
      qrEmpty: '店主还没有上传微信二维码，请稍后再来看看',
      contactTip: '长按保存二维码，打开微信相册扫码添加我咨询',
      wechatSearchTip: '请搜索以下任意一个微信号：',
      wechatQrNote: '或扫描下方二维码添加微信选购商品。非诚勿扰。',
      notFound: '款式不存在'
    },
    mine: {
      heroSub: '顾客扫码添加微信咨询下单',
      goodsTitle: '商品管理',
      goodsDesc: '新增 / 编辑美甲，手动上架、下架',
      settingTitle: '后台设置',
      settingDesc: '上传微信二维码，展示给顾客',
      mediaTitle: '素材上传',
      mediaDesc: '把图片 / 演示视频传到云存储，复制文件 ID',
      logout: '退出管理员登录',
      logoutTitle: '退出登录',
      logoutConfirm: '确定要退出管理员后台吗？',
      loginTitle: '管理员登录',
      loginDesc: '请输入管理员密码进入后台（商品管理 / 素材上传 / 后台设置）',
      passwordPlaceholder: '请输入管理员密码',
      loginButton: '登录并进入后台',
      loginSuccess: '登录成功',
      loginFailed: '登录失败',
      verifying: '验证中',
      enterPassword: '请输入管理员密码',
      logoutSuccess: '已退出',
      language: '语言',
      languageValue: '中文'
    },
    notifications: {
      title: '通知',
      empty: '暂无通知'
    },
    adminGoods: {
      tip: '只保留在后台，可随时下架 / 重新上架',
      add: '新增美甲',
      loading: '正在加载商品…',
      empty: '还没有商品，点击「新增美甲」上架第一款吧',
      onSale: '已上架',
      offSale: '已下架',
      edit: '编辑',
      putOff: '下架',
      putOn: '上架',
      delete: '删除',
      newTitle: '新增美甲',
      editTitle: '编辑美甲',
      nameField: '款式名称',
      namePlaceholder: '例如：蝴蝶结短甲',
      priceField: '价格（€）',
      stockField: '库存（双）',
      imagesField: '美甲图片（最多 9 张，第一张为封面）',
      upload: '上传',
      cancel: '取消',
      save: '保存',
      saveLoading: '保存中',
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      deleting: '删除中',
      deleted: '已删除',
      processing: '处理中',
      operationFailed: '操作失败',
      deleteTitle: '删除款式',
      deleteContent: '确定删除「{name}」吗？删除后不可恢复。',
      errName: '请填写款式名称',
      errPrice: '请填写正确的价格',
      errStock: '请填写正确的库存数量',
      errImages: '请至少上传 1 张美甲图片',
      maxImages: '最多上传 9 张图片',
      uploadFailed: '图片上传失败',
      uploadingText: '上传图片中',
      stockLabel: '库存'
    },
    adminSetting: {
      title: '微信二维码',
      desc: '上传你的微信二维码图片，保存后所有商品详情页都会显示这张二维码，顾客长按保存后打开微信扫码添加你。',
      current: '当前展示的二维码',
      empty: '还没有上传微信二维码',
      change: '更换二维码',
      upload: '上传微信二维码',
      noticeTitle: '小提示',
      notice1: '1. 建议上传包含完整边框、清晰的微信二维码截图；',
      notice2: '2. 小程序内无法直接识别二维码，顾客需长按保存图片，再到微信「扫一扫 → 相册」扫码；',
      notice3: '3. 更换图片后，顾客打开的详情页会立即使用新二维码。',
      uploading: '上传二维码中',
      saved: '二维码已保存',
      uploadFailed: '上传失败，请重试',
      loadFailed: '加载失败'
    },
    adminMedia: {
      title: '素材上传',
      subtitle: '图片和视频会上传到云开发云存储（由 CDN 分发），不会打进小程序代码包。',
      choose: '选择图片 / 视频上传',
      chooseNote: '支持一次多选。上传完成后复制下方的“文件 ID”，它是稳定的云端地址。',
      uploading: '正在上传素材…',
      chooseFailed: '选择素材失败',
      uploadFailed: '上传失败，请检查云开发环境是否已开通',
      uploaded: '上传成功',
      migrateButton: '一键上传项目当前的两张示例图',
      migrateNote: '只会上传 nails_picture 里的 001.jpg 与 back.jpg；成功后复制文件 ID 并替换 products.js 里的路径。',
      migrateFailed: '示例图上传失败，请改用上方“选择图片 / 视频上传”',
      copied: '文件 ID 已复制',
      copy: '复制',
      imageLabel: '图片',
      videoLabel: '视频',
      listTitle: '本次已上传的素材',
      empty: '还没有上传记录',
      stepsTitle: '上传后如何引用',
      step1: '1. 打开 miniprogram/nails_picture/products.js，把商品图片路径替换为复制的文件 ID；演示视频填进 videos 数组。',
      step2: '2. 把 miniprogram/nails_picture 里的本地大图移出项目（例如放到 NailShop/original_assets 备份），再重新上传。',
      step3: '3. 只有 tabBar 图标这类必要小图继续留在代码包；商品图和视频都走云存储文件 ID。'
    }
  },

  en: {
    common: {
      loading: 'Loading...',
      retry: 'Retry',
      soldOut: 'Sold Out',
      soldOutLabel: 'Sold Out',
      stockPrefix: 'In stock',
      codePrefix: 'No.',
      size: 'Size',
      copy: 'Copy',
      copied: 'Copied',
      backHome: 'Browse other styles'
    },
    share: {
      shopName: 'Mohen Nails Press-ons',
      homeTitle: 'Mohen Nails Press-ons · Scan the QR code to order',
      homeTimelineTitle: 'Mohen Nails Press-ons · New styles added often',
      friendSuffix: ' · Scan the QR code to order',
      timelineSuffix: ' | Mohen Nails Press-ons',
      detailButton: 'Share this style',
      detailCardTitle: 'Like this style?',
      timelineHint: 'You can also tap "···" at the top right to share to Moments',
      singlePageHint: 'You are viewing a Moments share page. Tap "Open Mini Program" at the bottom to see all styles.'
    },
    index: {
      heroSub: 'Handmade · Chosen with Care',
      sectionTitle: 'Featured Styles',
      categoryStyles: 'Nail Styles',
      categoryAccessories: 'Accessories',
      demoTitle: 'How to Use',
      empty: 'No styles available yet. Please check back later.'
    },
    detail: {
      soldTip: 'This style is sold out. Scan the QR code to contact me about restocking.',
      contactTitle: 'Contact Me',
      qrLoadFailed: 'Failed to load the QR code. Please try again or contact the shop owner.',
      qrEmpty: 'The QR code has not been uploaded yet. Please check back later.',
      contactTip: 'Long press to save the QR code, then scan it from your WeChat album to add me.',
      wechatSearchTip: 'Search for one of the following WeChat IDs:',
      wechatQrNote: 'Or scan the QR code below to add me on WeChat for purchases. Serious inquiries only.',
      notFound: 'Style not found'
    },
    mine: {
      heroSub: 'Scan to add my WeChat and place an order',
      goodsTitle: 'Manage Products',
      goodsDesc: 'Add / edit nail styles and put them on or off sale',
      settingTitle: 'Settings',
      settingDesc: 'Upload the WeChat QR code shown to customers',
      mediaTitle: 'Upload Media',
      mediaDesc: 'Upload images / demo videos and copy their file IDs',
      logout: 'Log Out',
      logoutTitle: 'Log Out',
      logoutConfirm: 'Are you sure you want to log out of admin mode?',
      loginTitle: 'Admin Login',
      loginDesc: 'Enter the admin password to manage products, media uploads and settings',
      passwordPlaceholder: 'Enter admin password',
      loginButton: 'Log In',
      loginSuccess: 'Logged in',
      loginFailed: 'Login failed',
      verifying: 'Verifying',
      enterPassword: 'Please enter the admin password',
      logoutSuccess: 'Logged out',
      language: 'Language',
      languageValue: 'English'
    },
    notifications: {
      title: 'Notifications',
      empty: 'No notifications'
    },
    adminGoods: {
      tip: 'Only visible in admin. Take styles off/on sale anytime.',
      add: 'Add Nail Style',
      loading: 'Loading products...',
      empty: 'No products yet. Tap "Add Nail Style" to add your first style.',
      onSale: 'On Sale',
      offSale: 'Off Sale',
      edit: 'Edit',
      putOff: 'Off Sale',
      putOn: 'On Sale',
      delete: 'Delete',
      newTitle: 'Add Nail Style',
      editTitle: 'Edit Nail Style',
      nameField: 'Style Name',
      namePlaceholder: 'e.g. Bow short nails',
      priceField: 'Price (€)',
      stockField: 'Stock',
      imagesField: 'Images (max 9, first one is cover)',
      upload: 'Upload',
      cancel: 'Cancel',
      save: 'Save',
      saveLoading: 'Saving',
      saveSuccess: 'Saved',
      saveFailed: 'Save failed',
      deleting: 'Deleting',
      deleted: 'Deleted',
      processing: 'Processing',
      operationFailed: 'Operation failed',
      deleteTitle: 'Delete Style',
      deleteContent: 'Delete "{name}"? This cannot be undone.',
      errName: 'Please enter the style name',
      errPrice: 'Please enter a valid price',
      errStock: 'Please enter a valid stock number',
      errImages: 'Please upload at least 1 image',
      maxImages: 'You can upload up to 9 images',
      uploadFailed: 'Image upload failed',
      uploadingText: 'Uploading image',
      stockLabel: 'Stock'
    },
    adminSetting: {
      title: 'WeChat QR Code',
      desc: 'Upload your WeChat QR code. After saving, it will be shown on every product detail page so customers can long-press and scan to add you.',
      current: 'Current QR code',
      empty: 'No WeChat QR code uploaded yet',
      change: 'Change QR Code',
      upload: 'Upload WeChat QR Code',
      noticeTitle: 'Tips',
      notice1: '1. Upload a clear WeChat QR screenshot with a complete border.',
      notice2: '2. Mini programs cannot scan QR codes directly. Customers save the image and scan it from the WeChat album.',
      notice3: '3. After changing the image, detail pages will use the new QR code immediately.',
      uploading: 'Uploading QR code',
      saved: 'QR code saved',
      uploadFailed: 'Upload failed, please retry',
      loadFailed: 'Failed to load'
    },
    adminMedia: {
      title: 'Upload Media',
      subtitle: 'Images and videos are uploaded to CloudBase storage (served through CDN), not bundled into the mini program package.',
      choose: 'Choose Images / Videos',
      chooseNote: 'You can select multiple files at once. After uploading, copy the stable cloud file ID below.',
      uploading: 'Uploading media…',
      chooseFailed: 'Failed to choose media',
      uploadFailed: 'Upload failed. Make sure CloudBase is enabled for this project.',
      uploaded: 'Uploaded',
      migrateButton: 'Upload the two current sample images',
      migrateNote: 'Uploads 001.jpg and back.jpg from nails_picture, then copy the file IDs and replace the paths in products.js.',
      migrateFailed: 'Failed to upload sample images. Use the choose button above instead.',
      copied: 'File ID copied',
      copy: 'Copy',
      imageLabel: 'Image',
      videoLabel: 'Video',
      listTitle: 'Uploaded in this session',
      empty: 'No uploads yet',
      stepsTitle: 'How to reference the files',
      step1: '1. Open miniprogram/nails_picture/products.js and replace local image paths with the copied file IDs; put demo videos in the videos array.',
      step2: '2. Move large local files out of miniprogram/nails_picture (e.g. into NailShop/original_assets as a backup), then upload the mini program again.',
      step3: '3. Keep only small necessary files such as tabBar icons in the code package. Product images and videos should use cloud file IDs.'
    }
  }
};

function normalizeLanguage(language) {
  return language === 'en' ? 'en' : 'zh';
}

function getLanguage() {
  return normalizeLanguage(wx.getStorageSync(STORAGE_KEY));
}

function setLanguage(language) {
  const next = normalizeLanguage(language);
  wx.setStorageSync(STORAGE_KEY, next);
  return next;
}

function getMessages(language) {
  const lang = normalizeLanguage(language || getLanguage());
  return messages[lang];
}

function getMessage(language, key) {
  const lang = normalizeLanguage(language);
  const fallbackLang = lang === 'en' ? 'en' : 'zh';
  const parts = key.split('.');
  let node = messages[fallbackLang];
  for (const part of parts) {
    if (!node) return key;
    node = node[part];
  }
  return typeof node === 'string' ? node : key;
}

function languageSwitchText(language) {
  return normalizeLanguage(language) === 'zh' ? 'EN' : '中文';
}

function localizeProduct(product, language) {
  if (!product) return product;
  const lang = normalizeLanguage(language);
  const localized = { ...product };

  if (lang === 'en' && product.nameEn) {
    localized.name = product.nameEn;
  }
  if (lang === 'en' && product.descriptionEn) {
    localized.description = product.descriptionEn;
  }
  if (lang === 'en' && product.unitEn) {
    localized.unit = product.unitEn;
  }

  const stock = Number(product.stock);
  if (Number.isInteger(stock)) {
    localized.stockText =
      stock === 0
        ? getMessage(lang, 'common.soldOutLabel')
        : `${getMessage(lang, 'common.stockPrefix')} ${stock}`;
  }

  return localized;
}

module.exports = {
  STORAGE_KEY,
  DEFAULT_LANGUAGE,
  getLanguage,
  setLanguage,
  getMessages,
  getMessage,
  languageSwitchText,
  localizeProduct
};

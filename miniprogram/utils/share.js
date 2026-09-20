// 转发 / 分享到朋友圈 统一封装
//
// 微信官方规则（详见 README「转发与分享到朋友圈」）：
// 1. 页面必须定义 onShareAppMessage，才允许「发送给朋友」；
// 2. 在满足第 1 条的前提下，再定义 onShareTimeline，才允许「分享到朋友圈」；
// 3. 小程序不能用代码主动弹出分享面板，只能由右上角菜单或
//    <button open-type="share"> 触发，因此每个页面都要放一个转发按钮；
// 4. 朋友圈打开的是「单页模式」，不能跳页、没有登录态，需单独适配。

const i18n = require('./i18n');

const HOME_PATH = '/pages/index/index';
const DETAIL_PATH = '/pages/detail/detail';
const SINGLE_PAGE_SCENE = 1154;

function getScene() {
  try {
    if (wx.getEnterOptionsSync) {
      const options = wx.getEnterOptionsSync() || {};
      if (options.scene !== undefined) return Number(options.scene);
    }
  } catch (error) {
    // 低版本基础库没有该接口，继续用启动参数兜底
  }
  try {
    const options = wx.getLaunchOptionsSync() || {};
    return Number(options.scene);
  } catch (error) {
    return NaN;
  }
}

// 场景值 1154 = 用户从朋友圈分享页打开（单页模式）。
// 每次实时读取启动参数，避免「先进小程序、再从朋友圈进来」时读到旧场景值。
function isSinglePageMode() {
  return getScene() === SINGLE_PAGE_SCENE;
}

// 打开右上角菜单里的「发送给朋友 / 分享到朋友圈」入口。
// menus 参数需要基础库 2.11.3，低版本会调用失败，失败时退回默认菜单。
// 单页模式下转发相关接口不可用，直接跳过，避免弹「请前往小程序使用完整服务」。
function enableShareMenu() {
  if (isSinglePageMode()) return;
  if (typeof wx === 'undefined' || !wx.showShareMenu) return;
  try {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      fail() {
        try {
          wx.showShareMenu({ withShareTicket: true });
        } catch (error) {
          // 忽略：极低版本基础库不支持该接口
        }
      }
    });
  } catch (error) {
    // 忽略：基础库版本过低
  }
}

// 分享图支持 https 网络图、代码包本地图，以及云文件 ID（基础库 2.8.1 起）；
// 页面里优先传解析好的 https 临时链接，没有解析结果时退回 cloud:// 文件 ID，
// 两者都没有就交给微信默认截图。
function isShareableImage(value) {
  if (typeof value !== 'string' || !value) return false;
  return /^https?:\/\//.test(value) || value.indexOf('cloud://') === 0;
}

function withImage(payload, imageUrl) {
  if (isShareableImage(imageUrl)) {
    payload.imageUrl = imageUrl;
  }
  return payload;
}

// 详情页参数：本地款式用编号 code，云端款式用数据库 id。
// 朋友圈分享不支持自定义 path，只能带 query，所以两者分开拼。
function detailQuery(product, fallbackId) {
  const code = product && product.code ? String(product.code).trim() : '';
  if (code) return `code=${encodeURIComponent(code)}`;
  const id = (product && (product._id || product.id)) || fallbackId || '';
  return id ? `id=${encodeURIComponent(String(id))}` : '';
}

function detailPath(product, fallbackId) {
  const query = detailQuery(product, fallbackId);
  return query ? `${DETAIL_PATH}?${query}` : HOME_PATH;
}

function productName(product, lang) {
  return (product && product.name) || i18n.getMessage(lang, 'share.shopName');
}

function homeShare(lang, imageUrl) {
  return withImage(
    {
      title: i18n.getMessage(lang, 'share.homeTitle'),
      path: HOME_PATH
    },
    imageUrl
  );
}

function homeTimeline(lang, imageUrl, query) {
  return withImage(
    {
      title: i18n.getMessage(lang, 'share.homeTimelineTitle'),
      query: query || ''
    },
    imageUrl
  );
}

function productShare(product, options = {}) {
  const lang = options.lang;
  const price = product && product.priceLabel ? product.priceLabel : '';
  const name = productName(product, lang);
  return withImage(
    {
      title: `${price ? `${name} ${price}` : name}${i18n.getMessage(lang, 'share.friendSuffix')}`,
      path: detailPath(product, options.fallbackId)
    },
    options.imageUrl
  );
}

function productTimeline(product, options = {}) {
  const lang = options.lang;
  return withImage(
    {
      title: `${productName(product, lang)}${i18n.getMessage(lang, 'share.timelineSuffix')}`,
      query: detailQuery(product, options.fallbackId)
    },
    options.imageUrl
  );
}

function productFavorite(product, options = {}) {
  return withImage(
    {
      title: `${productName(product, options.lang)}${i18n.getMessage(options.lang, 'share.timelineSuffix')}`,
      query: detailQuery(product, options.fallbackId)
    },
    options.imageUrl
  );
}

module.exports = {
  HOME_PATH,
  DETAIL_PATH,
  SINGLE_PAGE_SCENE,
  isSinglePageMode,
  enableShareMenu,
  isShareableImage,
  withImage,
  detailPath,
  detailQuery,
  homeShare,
  homeTimeline,
  productShare,
  productTimeline,
  productFavorite
};

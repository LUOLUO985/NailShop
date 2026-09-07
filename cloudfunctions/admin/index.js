const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const PRODUCTS = 'products';
const SETTINGS = 'settings';

// 上线前请修改下面的默认密码，或在云函数配置中设置 ADMIN_PASSWORD 环境变量
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

const ADMIN_ACTIONS = new Set([
  'adminListProducts',
  'adminCreateProduct',
  'adminUpdateProduct',
  'adminToggleProduct',
  'adminDeleteProduct',
  'adminSaveQr'
]);

function ok(data = {}) {
  return { ok: true, data };
}

function fail(error) {
  return { ok: false, error };
}

function timeValue(value) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'object' && value.$date) return timeValue(value.$date);
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortByUpdated(list) {
  return [...list].sort((a, b) => timeValue(b.updatedAt) - timeValue(a.updatedAt));
}

function isCollectionMissing(error) {
  const text = String((error && (error.errMsg || error.message)) || '');
  return /collection.{0,20}not[_ ]?exist|not[_ ]?exist.{0,20}collection|DATABASE_COLLECTION_NOT_EXIST|集合不存在/i.test(text);
}

async function withCollection(name, task) {
  try {
    return await task(db.collection(name));
  } catch (error) {
    if (isCollectionMissing(error)) {
      try {
        await db.createCollection(name);
      } catch (createError) {
        // 集合可能刚被并发创建，忽略
      }
      return task(db.collection(name));
    }
    throw error;
  }
}

async function ensureCollections() {
  for (const name of [PRODUCTS, SETTINGS]) {
    try {
      await db.createCollection(name);
    } catch (error) {
      // 已存在则忽略
    }
  }
}

function cleanProductFields(event = {}) {
  const name = String(event.name || '').trim();
  const price = Number(event.price);
  const stock = Number(event.stock);
  const images = Array.isArray(event.images)
    ? event.images
        .filter((fileID) => typeof fileID === 'string' && fileID.startsWith('cloud://'))
        .slice(0, 9)
    : [];
  const videos = Array.isArray(event.videos)
    ? event.videos
        .filter((fileID) => typeof fileID === 'string' && fileID.startsWith('cloud://'))
        .slice(0, 9)
    : [];

  if (!name) throw new Error('请填写款式名称');
  if (name.length > 60) throw new Error('款式名称不能超过 60 个字');
  if (!Number.isFinite(price) || price < 0) throw new Error('请填写正确的价格');
  if (!Number.isInteger(stock) || stock < 0) throw new Error('请填写正确的库存');
  if (images.length === 0) throw new Error('请至少上传 1 张美甲图片');

  return {
    name,
    price: Math.round(price * 100) / 100,
    stock,
    images,
    videos
  };
}

async function getCatalog() {
  const res = await withCollection(PRODUCTS, (collection) =>
    collection.where({ isOnSale: true }).limit(1000).get()
  );
  return ok({ products: sortByUpdated(res.data) });
}

async function getQr() {
  const res = await withCollection(SETTINGS, (collection) =>
    collection.where({ key: 'wechatQr' }).limit(1).get()
  );
  const first = res.data && res.data[0];
  return ok({ fileID: (first && first.fileID) || '' });
}

async function getDetail(event) {
  const id = String(event.id || '').trim();
  if (!id) return ok({ product: null, qrFileID: '' });

  let product = null;
  try {
    const res = await withCollection(PRODUCTS, (collection) =>
      collection.doc(id).get()
    );
    if (res.data && res.data.isOnSale === true) {
      product = res.data;
    }
  } catch (error) {
    const text = String((error && (error.errMsg || error.message)) || '');
    if (!/not[_ ]?exist|不存在/i.test(text)) {
      throw error;
    }
    // 商品不存在或已删除，返回 null
  }

  const qr = await getQr();
  return ok({ product, qrFileID: (qr.data && qr.data.fileID) || '' });
}

async function adminListProducts() {
  const res = await withCollection(PRODUCTS, (collection) =>
    collection.limit(1000).get()
  );
  return ok({ products: sortByUpdated(res.data) });
}

async function adminCreateProduct(event) {
  const fields = cleanProductFields(event);
  const now = db.serverDate();
  const res = await withCollection(PRODUCTS, (collection) =>
    collection.add({
      data: {
        ...fields,
        isOnSale: true,
        createdAt: now,
        updatedAt: now
      }
    })
  );
  return ok({ id: res._id });
}

async function adminUpdateProduct(event) {
  const id = String(event.id || '').trim();
  if (!id) throw new Error('缺少商品 ID');
  const fields = cleanProductFields(event);
  await withCollection(PRODUCTS, (collection) =>
    collection.doc(id).update({
      data: {
        ...fields,
        updatedAt: db.serverDate()
      }
    })
  );
  return ok({ id });
}

async function adminToggleProduct(event) {
  const id = String(event.id || '').trim();
  if (!id) throw new Error('缺少商品 ID');
  const current = await withCollection(PRODUCTS, (collection) =>
    collection.doc(id).get()
  );
  const nextIsOnSale = !(current.data && current.data.isOnSale);
  const res = await withCollection(PRODUCTS, (collection) =>
    collection.doc(id).update({
      data: {
        isOnSale: nextIsOnSale,
        updatedAt: db.serverDate()
      }
    })
  );
  const product = {
    ...(current.data || {}),
    isOnSale: nextIsOnSale
  };
  return ok({ product, updated: (res.stats && res.stats.updated) || 0 });
}

async function adminDeleteProduct(event) {
  const id = String(event.id || '').trim();
  if (!id) throw new Error('缺少商品 ID');
  await withCollection(PRODUCTS, (collection) => collection.doc(id).remove());
  return ok({ id });
}

async function adminSaveQr(event) {
  const fileID = String(event.fileID || '').trim();
  if (!fileID.startsWith('cloud://')) {
    throw new Error('二维码图片无效，请重新上传');
  }
  await withCollection(SETTINGS, (collection) =>
    collection.doc('wechatQr').set({
      data: {
        key: 'wechatQr',
        fileID,
        updatedAt: db.serverDate()
      }
    })
  );
  return ok({ fileID });
}

exports.main = async (event = {}) => {
  const { action } = event;
  try {
    if (action === 'login') {
      if (String(event.password || '') !== ADMIN_PASSWORD) {
        return fail('管理员密码错误');
      }
      await ensureCollections();
      return ok();
    }

    if (action === 'getCatalog') return await getCatalog();
    if (action === 'getQr') return await getQr();
    if (action === 'getDetail') return await getDetail(event);

    if (ADMIN_ACTIONS.has(action)) {
      if (String(event.password || '') !== ADMIN_PASSWORD) {
        return fail('管理员密码错误');
      }
      switch (action) {
        case 'adminListProducts':
          return await adminListProducts();
        case 'adminCreateProduct':
          return await adminCreateProduct(event);
        case 'adminUpdateProduct':
          return await adminUpdateProduct(event);
        case 'adminToggleProduct':
          return await adminToggleProduct(event);
        case 'adminDeleteProduct':
          return await adminDeleteProduct(event);
        case 'adminSaveQr':
          return await adminSaveQr(event);
        default:
          return fail('未知操作');
      }
    }

    return fail('未知操作');
  } catch (error) {
    console.error('admin cloud function error:', error);
    return fail((error && error.message) || '服务异常，请稍后重试');
  }
};

/**
 * ============================================================
 *  ★★★ 墨痕Nails 商品信息配置文件 ★★★
 *  📌 商品图片 / 演示视频推荐使用云存储地址：
 *    在「我的 → 素材上传」里把文件传到云存储并复制“文件 ID”，
 *    再把文件 ID 填到下面的 images / videos 里，不要放到代码包里。
 *
 *  以后要上架新商品 / 修改商品信息，主要就是改这个文件。
 *  保存后回到小程序首页刷新，新内容就会显示出来。
 *
 *  ── 新增商品的步骤 ──
 *  1. 用「我的 → 素材上传」上传商品图 / 演示视频，复制文件 ID；
 *  2. 复制下面 products 里的任意一段商品配置；
 *  3. 改编号、名称、价格，并把文件 ID 填到 images / videos 里。
 *
 *  只有 tabBar 图标这类必要小图才留在代码包；
 *  超过 200K 的图片/音频/视频请一律使用云存储或 CDN 的 URL。
 *
 *  每个商品都必须有唯一的“商品编号 code”，非常重要：
 *  001 之后请按 002、003、004…… 顺序递增，不要重复。
 * ============================================================
 */

const products = [
  {
    // ★★★ 商品编号（唯一，很重要）：这是顾客看到的编号，新增商品必须换新号
    code: '001',

    // 商品名称，可以自由修改
    name: '墨痕 001 号',

    // 英文名称（选填）：切换英文时显示；不填则继续显示上面的中文名
    nameEn: 'Mohen Style 001',

    // 价格：直接写数字；例如 5 表示 5 欧元
    price: 5,

    // 货币符号：按你的要求这里用欧元 €；以后如果改人民币就改成 '¥'
    currency: '€',

    // 商品图片：优先使用云存储文件 ID（cloud://…）或 CDN 的 https URL。
    // 一个商品想放多张图，就在数组里多加一个地址。
    images: ['/nails_picture/001.jpg'],

    // 演示视频（选填）：上传到云存储后，把文件 ID 放进数组即可。
    // 例：videos: ['cloud://环境ID.xxx/nails_assets/20260907/demo.mp4']
    videos: [],

    // 库存：0 会显示“售罄”；目前只是展示，可写 1 表示在售
    stock: 1,

    // 是否上架：true = 首页展示；false = 暂不展示（下架）
    isOnSale: true,

    // 款式介绍，以后进详情页会用到，可先随便写
    description: '墨痕穿戴甲 001 号',

    // 英文介绍（选填）
    descriptionEn: 'Mohen nail art style 001'
  }

  // ───────────────
  // 以后新增 002 号商品时，在上一行后面加“,”，再复制下面这段并修改：
  // {
  //   code: '002',                          // ★ 换成新商品编号
  //   name: '墨痕 002 号',                  // 名称
  //   nameEn: 'Mohen Style 002',            // 英文名称（选填）
  //   price: 5,                             // 价格
  //   currency: '€',                        // 货币符号
  //   images: ['cloud://…/002.jpg'],         // 云存储文件 ID 或 https URL
  //   videos: ['cloud://…/002.mp4'],         // 演示视频（选填）
  //   stock: 1,
  //   isOnSale: true,
  //   description: '墨痕穿戴甲 002 号',
  //   descriptionEn: 'Mohen nail art style 002' // 英文介绍（选填）
  // }
];

module.exports = {
  // 店铺名称：首页背景上方显示
  shopName: '墨痕Nails',

  // 首页顶部背景图（和本文件在同一目录）
  heroImage: '/nails_picture/back.jpg',

  // 商品列表
  products,

  // 根据商品编号查找商品，供详情页使用
  findProductByCode(code) {
    const target = String(code || '').trim();
    return products.find((item) => String(item.code) === target) || null;
  }
};

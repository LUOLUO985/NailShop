# 墨痕Nails 穿戴甲小程序

微信云开发小程序：**不做在线支付**。顾客浏览上架的美甲款式，在详情页长按保存店主上传的微信二维码，再用微信「扫一扫 → 相册」扫码添加店主咨询下单。

## 功能

- 首页：顶部展示 `back.HEIC` 转换后的背景图与艺术字店名「墨痕Nails」。
- 首页商品：读取 `miniprogram/nails_picture/products.js` 中配置的商品，展示编号、价格、库存。
- 详情页：多张轮播图、名称、价格、库存、售罄提示，以及店主上传的微信二维码图片；二维码图片支持长按保存。
- 中英文切换：首页「EN / 中文」按钮或「我的 → Language」随时切换，选择会保存在本机。
- 我的 / 商品管理 / 后台设置：保留昨天的云端后台（可选）；目前首页商品来自本地 `nails_picture/products.js`，两条数据源暂未打通。

## ★ 日常改商品资料（最重要的文件）

首页顶部背景、商品图片和商品列表都来自同一个封装目录（已放入项目）：

- 商品配置文件：[miniprogram/nails_picture/products.js](miniprogram/nails_picture/products.js) ← **日常改这里**
- 图片目录：`miniprogram/nails_picture/`

新增商品的流程：

1. 在微信开发者工具里登录「我的」后台，打开 **素材上传**，选择图片或演示视频；上传完成后复制“文件 ID”（形如 `cloud://…`）。开发者工具里可直接从电脑本地选文件。
2. 打开 `products.js`，复制其中一段商品配置，把云存储文件 ID 填到 `images`（演示视频填到 `videos`），并修改编号、名称、价格。
3. 每个商品编号（`code`）必须唯一，按 `001 → 002 → 003` 递增。

> 图片、演示视频请不要再放进 `miniprogram/nails_picture/`。超过 200K 的媒体走云存储/URL 后，代码包里就不会再出现“静态资源体积过大”的提示；tabBar 图标这类必要小图才保留在代码包。

当前示例（`001.jpg`、`back.jpg` 迁移到云存储之前，暂时仍从本地读取）：

- 顶部背景图：`nails_picture/back.jpg`（由 `back.HEIC` 转换）
- 商品 001：`nails_picture/001.jpg`，编号 `001`，价格 `€5`

把 `001.jpg` / `back.jpg` 传到云存储后，只需要把 [products.js](miniprogram/nails_picture/products.js) 里的两处本地路径替换成对应文件 ID，并把两个本地文件移出 `miniprogram/` 目录即可。

商品资料支持中英文两套名称：在 `products.js` 里填写 `nameEn` / `descriptionEn` 后，切换英文时就会显示英文；不填则继续显示中文。

## 项目结构

```text
NailShop
├── cloudfunctions
│   └── admin            # 云函数：商品、库存、上架状态、二维码设置
├── miniprogram
│   ├── app.js           # 云开发初始化
│   ├── app.json         # 页面与底部 Tab
│   ├── config.js        # 云函数名 / storage key
│   ├── nails_picture    # ★ 商品配置（products.js）；大图/视频走云存储，不放入此目录
│   ├── utils            # 云函数调用与数据格式化
│   └── pages
│       ├── index         # 首页
│       ├── detail        # 美甲详情 + 二维码联系板块
│       ├── mine          # 我的 / 管理员登录
│       ├── admin_goods   # 商品管理
│       ├── admin_setting # 二维码设置
│       └── admin_media   # 素材上传（商品图/演示视频传到云存储）
```

## 云端二维码与后台（可选）

以下步骤只影响「我的 → 后台」与详情页二维码；首页商品目前以本地 `nails_picture/products.js` 为准。

### 1. 导入项目

用微信开发者工具导入 `/Users/damen/NailShop`（`project.config.json` 已配置 `miniprogramRoot` 与 `cloudfunctionRoot`）。

### 2. 开通云开发并确认环境

在开发者工具顶部点击「云开发」，开通后得到一个环境 ID。

- `miniprogram/app.js` 中 `wx.cloud.init` 的 `env` 留空表示使用默认环境；如果账号下有多个环境，请把环境 ID 填进去。

### 3. 修改管理员密码

打开 `cloudfunctions/admin/index.js`，把：

```js
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
```

中的 `'123456'` 改成你自己的密码，然后保存。

> 也可以不改代码，在云开发控制台给 `admin` 云函数配置环境变量 `ADMIN_PASSWORD`，环境变量会优先生效。

### 4. 部署云函数

在开发者工具中右键 `cloudfunctions/admin` → **上传并部署：云端安装依赖**。

### 5. 首次登录初始化

在模拟器中打开小程序「我的」→ 输入管理员密码登录。登录成功后会自动创建两个集合：

- `products`：美甲商品
- `settings`：微信二维码设置

### 6. 云端后台开始使用

1. 进入「后台设置」上传你的微信二维码图片。
2. 顾客进入详情页长按二维码图片保存，再用微信扫码添加你。

### 7. 素材上传（商品图 / 演示视频）

1. 登录后台后进入「素材上传」，选择本地图片或视频（开发者工具里可以直接从电脑选文件），或点击「一键上传项目当前的两张示例图」。
2. 上传成功后复制“文件 ID”，把 `cloud://…` 地址填入 `products.js` 的 `images` / `videos`。
3. 将本地大文件移出 `miniprogram/nails_picture/` 后再上传小程序代码，代码包不再包含超过 200K 的图片/视频。

## 云存储权限说明

图片默认存在微信云存储中，默认权限是「所有用户可读，仅创建者可读写」，通常无需调整。

如果真机上顾客看不到商品图或二维码，请到云开发控制台 → 存储 → 权限设置，确认当前环境为「所有用户可读」或等效的自定义安全规则。

## 为什么是「长按保存二维码」

微信小程序内**不能直接识别图片里的二维码**。因此详情页使用带长按菜单的二维码图片，顾客长按图片 → 保存到手机相册 → 打开微信「扫一扫」→ 右上角相册图标 → 选择该二维码图片即可添加店主。

## 注意事项

- 本项目默认不做支付，不展示微信号文本，只展示二维码图片。
- 商品下架只是把 `isOnSale` 设为 `false`，不会删除后台记录。
- 商品库存填写 0 后，首页与详情页会自动显示「售罄」。

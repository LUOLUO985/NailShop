// 云存储图片/视频渲染辅助
//
// 安卓端直接把 cloud:// 文件 ID 塞给 <image>/<video> 时经常出现灰块/黑屏，
// 而 iOS 端表现正常。统一做法是先调用 wx.cloud.getTempFileURL 把文件 ID
// 换成 https 链接，再用链接去渲染。解析结果在模块内做缓存，同一会话内
// 多次进入页面不会重复请求；公有读文件拿到的链接本身就不会过期。
//
// 另外，云存储 CDN 自带「在线图片处理」，图片链接会额外拼上转码参数：
//   - format/jpg   ：把 iPhone 的 HEIC 转成真正的 JPEG（安卓微信不认 HEIC，
//                    iOS 能认，所以之前只有安卓看不到图）；
//   - thumbnail/1080x>：宽压到 1080（%3E 就是 URL 编码后的 ">"，表示只缩不放，
//                    小图不会被放大，二维码这类图片保持原尺寸），单张从 1.5MB 降到约 180KB；
//   - quality/85   ：JPEG 质量。
// 处理结果由 CDN 缓存（约 30 天），不占云存储空间、也不需要重新上传图片。
// 已经转成 JPEG 的图片再拼这些参数是无副作用的空操作。

const urlCache = Object.create(null);

const IMAGE_EXT = /\.(jpe?g|jpe|jfif|png|webp|gif|bmp|heic|heif|tiff?|avif)$/i;
const IMAGE_TRANSFORM = 'imageMogr2/format/jpg/thumbnail/1080x%3E/quality/85';

function isCloudFileID(value) {
  return typeof value === 'string' && value.indexOf('cloud://') === 0;
}

// 只有图片才拼转码参数，视频（nails.mov 等）保持原样
function isImagePath(pathOrUrl) {
  const withoutQuery = String(pathOrUrl || '').split('?')[0];
  return IMAGE_EXT.test(withoutQuery);
}

// cloud://<环境ID>.<存储桶>/<路径> -> https://<存储桶>.tcb.qcloud.la/<路径>
function buildPublicUrl(fileID) {
  const match = /^cloud:\/\/([^/]+)\/(.+)$/.exec(fileID || '');
  if (!match) return '';
  const dotIndex = match[1].indexOf('.');
  if (dotIndex < 0) return '';
  const bucket = match[1].slice(dotIndex + 1);
  return bucket ? `https://${bucket}.tcb.qcloud.la/${match[2]}` : '';
}

function withImageTransform(url) {
  if (typeof url !== 'string' || url.indexOf('http') !== 0) return url || '';
  if (!isImagePath(url)) return url;
  const separator = url.indexOf('?') >= 0 ? '&' : '?';
  return `${url}${separator}${IMAGE_TRANSFORM}`;
}

function isEntryValid(entry) {
  return Boolean(entry) && (!entry.expiresAt || entry.expiresAt > Date.now());
}

// 同步把单个文件 ID 换成展示链接；尚未解析或解析失败时原样返回，不抛错。
function resolveUrl(fileID) {
  if (!isCloudFileID(fileID)) return fileID || '';
  const entry = urlCache[fileID];
  if (isEntryValid(entry)) return withImageTransform(entry.url);
  // 图片即使还没等到 getTempFileURL 返回，也能立刻拿到可展示的地址
  if (isImagePath(fileID)) {
    const directUrl = buildPublicUrl(fileID);
    if (directUrl) return withImageTransform(directUrl);
  }
  return fileID;
}

// 批量换取临时链接。一次最多 50 个，超出会自动分批；单个或整批失败只告警，
// 不影响后续渲染（会退回 cloud://，至少保证 iOS 可用）。
async function resolveFileIDs(fileIDs) {
  const list = Array.isArray(fileIDs) ? fileIDs : [];
  const missing = [];
  const seen = {};

  list.forEach((fileID) => {
    if (isCloudFileID(fileID) && !isEntryValid(urlCache[fileID]) && !seen[fileID]) {
      seen[fileID] = true;
      missing.push(fileID);
    }
  });

  for (let start = 0; start < missing.length; start += 50) {
    const chunk = missing.slice(start, start + 50);
    try {
      const res = await wx.cloud.getTempFileURL({ fileList: chunk });
      (res.fileList || []).forEach((file) => {
        if (file && file.status === 0 && file.tempFileURL) {
          urlCache[file.fileID] = {
            url: file.tempFileURL,
            // 公有读文件通常不返回 maxAge，视为长期有效；
            // 私有读文件按返回的有效期缓存，过期后下次进入页面会重新换取。
            expiresAt: file.maxAge
              ? Date.now() + file.maxAge * 1000
              : 0
          };
        }
      });
    } catch (error) {
      console.warn('[cloudMedia] getTempFileURL failed:', error);
    }
  }
}

// 把一个对象里的图片/视频字段（cover / images / videos 等）预解析成可展示的
// https 链接，并返回浅拷贝副本，不改动传入的原始对象。
async function resolveMediaFields(item, fields) {
  const source = item || {};
  const fieldList = Array.isArray(fields) && fields.length
    ? fields
    : ['cover', 'images', 'videos', 'poster'];
  const fileIDs = [];

  fieldList.forEach((field) => {
    const value = source[field];
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry === 'string') fileIDs.push(entry);
      });
    } else if (typeof value === 'string') {
      fileIDs.push(value);
    }
  });

  await resolveFileIDs(fileIDs);

  const copy = Object.assign({}, source);
  fieldList.forEach((field) => {
    const value = source[field];
    if (Array.isArray(value)) {
      copy[field] = value.map((entry) => resolveUrl(entry));
    } else if (typeof value === 'string') {
      copy[field] = resolveUrl(value);
    }
  });
  return copy;
}

module.exports = {
  isCloudFileID,
  resolveUrl,
  resolveFileIDs,
  resolveMediaFields
};

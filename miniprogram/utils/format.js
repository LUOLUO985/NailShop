function toTimestamp(value) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'object' && value.$date) return toTimestamp(value.$date);
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(price) {
  const value = Number(price);
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function decorateProduct(product) {
  if (!product) return null;
  const stock = Number(product.stock);
  const safeStock = Number.isInteger(stock) ? stock : 0;
  const images = Array.isArray(product.images) ? product.images : [];
  return {
    ...product,
    stock: safeStock,
    priceText: formatPrice(product.price),
    priceLabel: `${product.currency || '¥'}${formatPrice(product.price)}`,
    cover: images[0] || '',
    images,
    soldOut: safeStock === 0,
    stockText: safeStock === 0 ? '已售罄' : `库存 ${safeStock}`
  };
}

module.exports = {
  toTimestamp,
  formatPrice,
  decorateProduct
};

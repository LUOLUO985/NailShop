const { cloudFunctionName, adminPasswordStorageKey } = require('../config');

function getAdminPassword() {
  return wx.getStorageSync(adminPasswordStorageKey) || '';
}

function hasAdminSession() {
  return !!getAdminPassword();
}

function clearAdminSession() {
  wx.removeStorageSync(adminPasswordStorageKey);
}

function isFunctionDeployError(error) {
  const text = `${(error && error.errMsg) || ''} ${(error && error.message) || ''}`;
  return /FunctionName|not found|not exist|找不到云函数|函数.*不存在/i.test(text);
}

function toFriendlyError(error) {
  if (isFunctionDeployError(error)) {
    return new Error('云函数未就绪，请先部署 admin 云函数（见项目 README）');
  }
  return error instanceof Error ? error : new Error((error && error.message) || '请求失败，请稍后重试');
}

async function callAction(action, payload = {}) {
  let res;
  try {
    res = await wx.cloud.callFunction({
      name: cloudFunctionName,
      data: { action, ...payload }
    });
  } catch (error) {
    throw toFriendlyError(error);
  }

  const result = res.result || {};
  if (!result.ok) {
    const message = result.error || '请求失败';
    if (message.indexOf('密码错误') >= 0) {
      clearAdminSession();
    }
    throw new Error(message);
  }
  return result.data || {};
}

async function callAdminAction(action, payload = {}) {
  const password = getAdminPassword();
  if (!password) {
    throw new Error('请先登录管理员');
  }
  return callAction(action, { password, ...payload });
}

function ensureAdminLogin() {
  if (hasAdminSession()) return true;
  wx.showToast({ title: '请先登录管理员', icon: 'none' });
  setTimeout(() => {
    wx.switchTab({ url: '/pages/mine/mine' });
  }, 600);
  return false;
}

module.exports = {
  callAction,
  callAdminAction,
  getAdminPassword,
  hasAdminSession,
  clearAdminSession,
  ensureAdminLogin
};

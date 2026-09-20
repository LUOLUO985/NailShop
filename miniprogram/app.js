// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      // 当前云环境 ID；图片/视频/云函数都使用这个环境
      env: 'cloudbase-d4guf8e8m5ba84eb5',
      traceUser: true
    });
    this.globalData = {};
  }
});

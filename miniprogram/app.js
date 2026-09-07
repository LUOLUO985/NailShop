// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      // env 留空表示使用默认云环境；如有多个环境请填写环境 ID
      env: '',
      traceUser: true
    });
    this.globalData = {};
  }
});

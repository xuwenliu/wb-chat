//app.js
import config from "./utils/config";

App({
  async onLaunch() {
    // 展示本地存储能力
    var logs = wx.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);
    this.globalData.userInfo = wx.getStorageSync("userInfo");
    this.globalData.u_account = wx.getStorageSync("u_account");
    // this.globalData.u_account = 'b5dd6a06d42011eaaa24525400d73870'
    config.TOKEN = this.globalData.u_account;
    this.globalData.u_role = wx.getStorageSync("u_role");
    if (this.globalData.userInfo != null && this.globalData.u_account != null) {
      console.log("更新登录");
      let userInfo = await this.getUserInfo().catch((err) => {
        console.log(err);
        // wx.showToast({
        //   icon: 'none',
        //   title: JSON.stringify(err)
        // })
      });
    }
  },

  // 更新登录信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.server + "user/web/updateLoginDate",
        data: {
          u_account: this.globalData.u_account,
        },
        success: function (res) {
          if (parseInt(res.statusCode) != 200) {
            reject(res);
            return;
          }
          console.log("更新了登录时间了");
          resolve(res.data);
        },
        fail(err) {
          reject(err);
        },
      });
    });
  },

  /**
   * 设置监听器
   */
  setWatcher(data, watch) {
    // 接收index.js传过来的data对象和watch对象
    Object.keys(watch).forEach((v) => {
      // 将watch对象内的key遍历
      this.observe(data, v, watch[v]); // 监听data内的v属性，传入watch内对应函数以调用
    });
  },

  /**
   * 监听属性 并执行监听函数
   */
  observe(obj, key, watchFun) {
    var val = obj[key]; // 给该属性设默认值
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        val = value;
        watchFun(value, val); // 赋值(set)时，调用对应函数
      },
      get: function () {
        return val;
      },
    });
  },
  globalData: {
    server: `${config.BASE_URL}/stall/`,
    userInfo: null,
    u_account: null,
    u_role: 0,
    pageName: "",
  },
});

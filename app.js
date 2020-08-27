//app.js
import config from './utils/config';

App({
  async onLaunch() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    this.globalData.userInfo = wx.getStorageSync('userInfo');
    this.globalData.u_account=wx.getStorageSync('u_account');
    // this.globalData.u_account = 'b5dd6a06d42011eaaa24525400d73870'
    config.TOKEN = this.globalData.u_account;
    this.globalData.u_role=wx.getStorageSync('u_role');
    if(this.globalData.userInfo!=null && this.globalData.u_account!=null){
      console.log("更新登录");
      let userInfo = await this.getUserInfo()
        .catch(err => {
          console.log(err)
          // wx.showToast({
          //   icon: 'none',
          //   title: JSON.stringify(err)
          // })
        });
    }
  },

  // 更新登录信息
  getUserInfo(){
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.server + 'user/web/updateLoginDate',
        data: {
          u_account: this.globalData.u_account
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
        }
      })
     
    })
  },
  globalData: {
    server: `${config.BASE_URL}/stall/`,
    userInfo: null,
    u_account:null,
    u_role:0,
    pageName: ''
  }
})
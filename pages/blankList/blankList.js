const app = getApp();
Page({
  data: {
    userList: [],
  },

  onLoad(options) {
    // 因为在chatList页面已经登录了IM这里就不需要登录了。
    this.getUserList();
    app.globalData.pageName = "blankList";
  },

  getUserList() {
    wx.showLoading();
    wx.tim.getBlacklist().then((res) => {
      if (res.data.length === 0) {
        wx.hideLoading();
        this.setData({
          userList: [],
        });
        return;
      }
      wx.tim
        .getUserProfile({
          userIDList: res.data,
        })
        .then((userRes) => {
          this.setData({
            userList: userRes.data,
          });
          wx.hideLoading();
        });
    });
  },

  removeBlacklist(e) {
    const userid = e.currentTarget.dataset.userid;
    wx.tim
      .removeFromBlacklist({
        userIDList: [userid],
      })
      .then(() => {
        this.getUserList();
        wx.showToast({
          title: "移除黑名单成功",
          icon: "none",
        });
      })
      .catch(() => {
        wx.showToast({
          title: "移除黑名单失败",
          icon: "none",
        });
      });
  },
});

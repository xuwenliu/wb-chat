import { Chat } from "../chat/init";
const app = getApp();
let that = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isSDKReady: false,
    userList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this;
    const selfUserId = app.globalData.userInfo.u_account;
    new Chat(this, selfUserId);
    app.setWatcher(this.data, this.watch); // 设置监听
  },

  getUserList() {
    wx.showLoading();
    wx.tim.getBlacklist().then((res) => {
      console.log("黑名单", res);
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
  watch: {
    isSDKReady(newValue) {
      if (newValue) {
        that.getUserList();
      }
    },
  },

  removeBlacklist(e) {
    const userid = e.currentTarget.dataset.userid;
    wx.tim
      .removeFromBlacklist({ userIDList: [userid] })
      .then((imResponse) => {
        this.getUserList();
        wx.showToast({
          title: "移除黑名单成功",
          icon: "none",
        });
      })
      .catch((err) => {
        wx.showToast({
          title: "移除黑名单失败",
          icon: "none",
        });
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    wx.tim.logout().then((imResponse) => {
      console.log("退出成功");
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});

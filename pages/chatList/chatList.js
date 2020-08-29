import { Chat } from "../chat/init";
import { filterDate } from '../../utils/util';
const app = getApp();
let that = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isSDKReady: false,
    conversationList: [],
  },
  watch: {
    isSDKReady(newValue) {
      if (newValue) {
        that.getConversationList();
      }
    },
  },
  // 更新当前所有会话列表
  updateAllConversation(list) {
    for (let i = 0; i < list.length; i++) {
      if (
        list[i].lastMessage &&
        typeof list[i].lastMessage.lastTime === "number"
      ) {
        let date = new Date(list[i].lastMessage.lastTime * 1000);
        list[i].lastMessage._lastTime = filterDate(date,'HH:mm');
      }
    }
    return [...list];
  },
  getConversationList() {
    wx.showLoading();
    wx.tim.getConversationList().then((imResponse) => {
      const conversationList = imResponse.data.conversationList;
      wx.hideLoading();
      console.log('this.updateAllConversation(conversationList)',this.updateAllConversation(conversationList))
      this.setData({
        conversationList: this.updateAllConversation(conversationList),
      });
      console.log("会话列表", imResponse);
    });
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('onHide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('onUnload')
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

  jumpBlackList() {
    wx.navigateTo({
      url: "../blankList/blankList",
    });
  },
});

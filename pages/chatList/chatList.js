import {
  Chat
} from "../chat/init";
import {
  filterDate
} from "../../utils/util";
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
        list[i].lastMessage._lastTime = filterDate(date, "HH:mm");
      }
    }
    return [...list];
  },
  getConversationList() {
    wx.showLoading();
    wx.tim.getConversationList().then((imResponse) => {
      const conversationList = imResponse.data.conversationList;
      wx.hideLoading();
      console.log(
        "this.updateAllConversation(conversationList)",
        this.updateAllConversation(conversationList)
      );
      this.setData({
        conversationList: this.updateAllConversation(conversationList),
      });
      console.log("会话列表", imResponse);
    });
  },

  // 监听消息接收
  messageReceived(event) {
    console.log("监听消息接收", event);
    this.getConversationList();
  },

  async goChat(e) {
    const {
      userid,
      avatar,
      conversationid,
      unreadcount,
    } = e.currentTarget.dataset;

    if (unreadcount * 1 > 0) {
      // 1.将消息设置为已读
      await wx.tim.setMessageRead({
        conversationID: conversationid,
      });
    }
    // 2.退出登录
    wx.tim.logout().then(() => {
      // 3.跳转
      wx.navigateTo({
        url: `../chat/chat?userId=${userid}&avatar=${avatar}&currentConversationID=${conversationid}`,
      });
    });
  },

  jumpBlackList() {
    wx.navigateTo({
      url: "../blankList/blankList",
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.globalData.pageName = "chatList";
    that = this;
  },

  onShow() {
    console.log("onShow");
    if (!app.globalData.userInfo.u_account) {
      wx.showModal({
        title: '提示',
        content: '请先授权登录',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: "../mine/mine"
            })
          }
        }
      })
      return;
    }
    new Chat(this, app.globalData.userInfo.u_account, this.messageReceived);
    app.setWatcher(this.data, this.watch); // 设置监听
    if (this.data.isSDKReady) {
      this.getConversationList();
    }
  },


  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },

  // 删除会话
  removeConversation(e) {
    const {
      conversationid
    } = e.currentTarget.dataset;
    wx.tim.deleteConversation(conversationid).then(() => {
      wx.showToast({
        title: '会话删除成功',
        icon: 'none'
      })
      this.getConversationList();
    }).catch(() => {
      wx.showToast({
        title: '会话删除失败',
        icon: 'none'
      })
    })
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("onHide");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log("onUnload");
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
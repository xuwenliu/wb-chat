import { Chat } from "../../utils/im";
import { filterDate } from "../../utils/util";
const app = getApp();
let that = null;

Page({
  data: {
    conversationList: [],
  },

  // 监控 isSDKReady是否就绪
  watch: {
    isSDKReady(newValue) {
      if (newValue) {
        that.getConversationList();
      }
    },
  },

  // 监听消息接收-直接重新获取会话列表即可
  messageReceived() {
    this.getConversationList();
  },

  onLoad(options) {
    that = this;
    app.setWatcher(app.globalData, this.watch); // 设置监听，主要是监听 isSDKReady
  },

  onShow() {
    app.globalData.pageName = "chatList";
    // 1.这里不能放在onLoad里面，因为切换tab只执行onShow，onLoad只是执行一次。
    // 阻止未授权的用户进入聊天列表
    const userInfo = wx.getStorageSync("userInfo");
    if (!userInfo.u_account) {
      wx.showModal({
        title: "提示",
        content: "请先授权登录",
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: "../mine/mine",
            });
          }
        },
      });
      return;
    }

    // 2.isSDKReady 如果sdk已经可以用了，则代表用户一定登录IM了，官方要求的登录后才会触发sdk的ready.
    // 已经登录了则直接获取会话列表
    if (app.globalData.isSDKReady) {
      this.getConversationList();
    }
    // 反之则登录-具体登录在Chat这个类里面实现的。
    new Chat(userInfo.u_account, this.messageReceived);
  },
  onPullDownRefresh() {
    this.getConversationList();
  },

  // 会话列表-格式化时间
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

  // 获取会话列表
  getConversationList() {
    wx.tim.getConversationList().then((imResponse) => {
      const conversationList = imResponse.data.conversationList;
      console.log("conversationList", conversationList);
      this.setData({
        conversationList: this.updateAllConversation(conversationList),
      });
      wx.stopPullDownRefresh();
    });
  },

  // 点击去聊天页
  async jumpChat(e) {
    const {
      userid,
      avatar,
      conversationid,
      unreadcount,
    } = e.currentTarget.dataset;

    // 1.将当前点击的会话的消息设置为已读
    if (unreadcount * 1 > 0) {
      await wx.tim.setMessageRead({
        conversationID: conversationid,
      });
    }
    // 2.跳转
    wx.navigateTo({
      url: `../chat/chat?userId=${userid}&avatar=${avatar}&currentConversationID=${conversationid}`,
    });
  },

  // 跳转黑名单
  jumpBlackList() {
    wx.navigateTo({
      url: "../blankList/blankList",
    });
  },

  // 长按删除会话
  handleLongPress(e) {
    wx.showActionSheet({
      itemList: ["删除"],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.removeConversation(e);
        }
      },
    });
  },

  // 删除会话
  removeConversation(e) {
    const { conversationid } = e.currentTarget.dataset;
    wx.tim
      .deleteConversation(conversationid)
      .then(() => {
        wx.showToast({
          title: "会话删除成功",
          icon: "none",
        });
        this.getConversationList();
      })
      .catch(() => {
        wx.showToast({
          title: "会话删除失败",
          icon: "none",
        });
      });
  },
});

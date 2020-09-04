import {
  mGetOtherUserInfo,
  mFollowUser,
  mCancelFollowUser,
} from "../../utils/actions";

const app = getApp();

Page({
  data: {
    showTopic: false,
    userId: "",
    account: "",
    userInfo: {},
    pageSize: 10,
    pageNo: 1,
    isRefresh: false,
  },

  onLoad(options) {
    console.log(options);
    app.globalData.pageName = "userInfo";
    this.setData({
      userId: options.userId,
      account: app.globalData.u_account,
      showTopic: true,
    });
    this.getUserInfo(options.userId);
  },
  async onShow() {
    // 判断是发布页面返回 刷新当前列表
    if (app.globalData.pageName == "userList") {
      this.getUserInfo();
      app.globalData.pageName = "";
    }
  },

  // 获取用户个人信息
  async getUserInfo(userId) {
    let res = await mGetOtherUserInfo({
      userId,
    });

    this.setData({
      userInfo: res.data,
    });
  },
  // 关注 取消关注
  async switchFollow(isFollow) {
    let requestApi = isFollow ? mCancelFollowUser : mFollowUser;
    await requestApi({
      userId: this.data.userId,
    });
    return Promise.resolve(isFollow);
  },

  // 取消关注
  async handlerSwitchFollow(e) {
    if (!app.globalData.u_account) {
      wx.showToast({
        icon: "none",
        title: "请先登录",
      });
      return;
    }
    let isFollow = e.currentTarget.dataset.isfollow;
    await this.switchFollow(isFollow);
    if (isFollow) {
      wx.showToast({
        icon: "none",
        title: "取消关注成功",
        duration: 500,
      });
    } else {
      wx.showToast({
        icon: "success",
        title: "关注成功",
        duration: 500,
      });
    }
    setTimeout(() => {
      this.getUserInfo(this.data.userId);
    }, 400);
  },

  // 查看关注我的粉丝
  handlerLookFans() {
    wx.navigateTo({
      url: `../userList/userList?type=0&userId=${this.data.userId}`,
    });
  },

  // 查看我关注的用户
  handlerLookMeFollow() {
    wx.navigateTo({
      url: `../userList/userList?type=1&userId=${this.data.userId}`,
    });
  },

  //私信
  chat() {
    const userInfo = wx.getStorageSync("userInfo");
    if (!userInfo.u_account) {
      wx.showModal({
        title: "提示",
        content: "请先授权登录",
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: "../mine/mine",
            });
          }
        },
      });
      return;
    } else {
      wx.navigateTo({
        url: `../chat/chat?userId=${this.data.userId}&avatar=${this.data.userInfo.icon}`,
      });
    }
  },
  onPullDownRefresh() {
    this.getUserInfo(this.data.userId);
    this.setData({
      pageNo: 1,
      isRefresh: true,
    });
  },
  onRefreshEnd() {
    wx.stopPullDownRefresh();
    this.isbottom = false;
    this.setData({
      isRefresh: false,
    });
  },
  onTellToBottom(e) {
    wx.showToast({
      icon: "none",
      title: "到底了~",
    });
    this.isbottom = true;
  },
  onReachBottom() {
    if (this.isbottom) {
      wx.showToast({
        icon: "none",
        title: "到底了~",
      });
      return;
    }
    let pageNo = this.data.pageNo;
    pageNo = pageNo + 1;
    this.setData({
      pageNo: pageNo++,
    });
  },
});

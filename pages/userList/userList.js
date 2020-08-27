import {
  mGetFollowUser,
  mGetFollowMeUser,
  mFollowUser,
  mCancelFollowUser
} from '../../utils/actions';

const app = getApp();

Page({
  data: {
    userList: [],
    account: ''
  },
  userId: '',
  type: 0,
  onLoad(options) {
    app.globalData.pageName == 'userList'
    this.setData({
      account: app.globalData.u_account
    })
    this.userId = options.userId;
    this.type = options.type; // 0 关注我的  1 我关注的
    this.getUserList();
  },

  // 获取用户列表
  async getUserList(){
    let requestApi = +this.type === 1 ? mGetFollowUser : mGetFollowMeUser;
    let res = await requestApi({
      userId: this.userId
    })
    
    this.setData({
      userList: res.data
    })
  },

  // 查看用户信息
  handlerLookUser(e){
    let userId = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: `../userInfo/userInfo?userId=${userId}`
    })
  },

  // 关注 取消关注
  async switchFollow(isFollow, userId){
    let requestApi = isFollow ? mCancelFollowUser : mFollowUser;
    await requestApi({
      userId
    });
    return Promise.resolve(isFollow);
  },

  // 取消关注
  async handlerSwitchFollow(e){
    if(!app.globalData.u_account){
      wx.showToast({
        icon: 'none',
        title: '请先登录',
      })
      return;
    }
    let isFollow = e.currentTarget.dataset.isfollow;
    let userId = e.currentTarget.dataset.userid;
    await this.switchFollow(isFollow, userId);
    if(isFollow){
      wx.showToast({
        icon: 'none',
        title: '取消关注成功',
        duration: 500
      })
    } else {
      wx.showToast({
        icon: 'success',
        title: '关注成功',
        duration: 500
      })
    }
    setTimeout(() => {
      this.getUserList();
    }, 400)
  }
})
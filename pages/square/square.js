import {
  mGetTopicTypeList,
} from '../../utils/actions';

const app = getApp();

Page({
  data: {
    account: '',
    navTab: [], // 帖子分类列表
    topicType: '', // 当前选中的帖子分类
    listType: 4, // 帖子列表类型   4 是广场分类 5是关注
    isAttention: false,
    showTopic: false,
    pageSize: 10,
    pageNo: 1,
    isRefresh: false
  },
  topicType: '',
  isbottom: false,
  async onLoad() {
    this.setData({
      account: app.globalData.u_account
    })
    // if (this.data.topicType && !this.data.isAttention) {
    //   this.setData({
    //     topicType: this.data.topicType,
    //     showTopic: true,
    //     isAttention: false,
    //     listType: 4
    //   })
    //   return;
    // }
    // if (this.data.isAttention) {
    //   this.setData({
    //     topicType: '',
    //     isAttention: true,
    //     showTopic: true,
    //     listType: 5
    //   })
    //   return;
    // }
    let topicType = await this.getTopicTypeList();
    this.setData({
      topicType,
      showTopic: true,
      listType: 4
    })
  },
  async onShow(){
    this.setData({
      account: app.globalData.u_account
    })
    // 判断是发布页面返回 刷新当前列表
    if (app.globalData.pageName == 'sendTopic'){
      this.onPullDownRefresh();
      app.globalData.pageName = '';
    }
  },

  // 获取帖子分类列表
  async getTopicTypeList(){
    let res = await mGetTopicTypeList({});
    if(res.data.length < 1) return Promise.resolve('');
    this.setData({
      navTab: res.data
    })
    return Promise.resolve(res.data[0]);
  },

  // 切换帖子分类
  handlerSwitchTab(e){
    let topicType = e.currentTarget.dataset.item;
    this.setData({
      topicType,
      isAttention: false,
      listType: 4,
      pageNo: 1,
      showTopic: false
    })
    setTimeout(() => {
      this.setData({
        showTopic: true
      })
    }, 200)
    
  },

  //切换到关注
  handlerSwitchAttention(){
    if(!app.globalData.u_account){
      wx.showToast({
        icon: 'none',
        title: '请先登录',
      })
      return;
    }
    this.setData({
      topicType: '关注',
      isAttention: true,
      listType: 5,
      pageNo: 1,
      showTopic: false
    })
    setTimeout(() => {
      this.setData({
        showTopic: true
      })
    }, 200)
  },
  
  onPullDownRefresh() {
    this.setData({
      pageNo: 1,
      isRefresh: true
    })
  },
  onRefreshEnd(){
    wx.stopPullDownRefresh();
    this.isbottom = false;
    this.setData({
      isRefresh: false
    })
  },
  onTellToBottom(e) {
    wx.showToast({
      icon: 'none',
      title: '到底了~',
    })
    this.isbottom = true;
  },
  onReachBottom(){
    if (this.isbottom){
      wx.showToast({
        icon: 'none',
        title: '到底了~',
      })
      return;
    }
    let pageNo = this.data.pageNo;
    pageNo = pageNo + 1
    this.setData({
      pageNo: pageNo++
    })
  }
})
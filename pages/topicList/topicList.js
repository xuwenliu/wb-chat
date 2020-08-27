const app = getApp();

Page({
  data: {
    listType: '',
    account: '',
    pageSize: 10,
    pageNo: 1,
    isRefresh: false
  },
  onLoad(options) {
    this.listType = options.listType ? options.listType : '';
    if(!this.listType) return;
    this.setData({
      account: app.globalData.u_account,
      listType: this.listType
    })
  },
  onShow(){
    // 判断是发布页面返回 刷新当前列表
    if (app.globalData.pageName && app.globalData.pageName == 'sendTopic') {
      this.setData({
        account: app.globalData.u_account,
        topicType: this.data.topicType,
        isAttention: false,
        listType: this.data.listType,
        pageNo: 1,
        isRefresh: true,
        showTopic: false
      })
      setTimeout(() => {
        this.setData({
          showTopic: true
        })
      }, 200)
      delete app.globalData.pageName;
    }
  },
  onPullDownRefresh() {
    console.log('11')
    this.setData({
      pageNo: 1,
      isRefresh: true
    })
  },
  onRefreshEnd() {
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
  onReachBottom() {
    if (this.isbottom) {
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
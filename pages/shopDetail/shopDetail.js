// pages/shopDetail/shopDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
     s_id:19,
     shop:null,
     phone:"",
     showTabV:true,
     showTabP:false,
     showTabI:false,
     showDetail:"",
     goods:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     this.setData({
       s_id:options.sid
     });
     this.getDetail();
    this.getGoods();
  },

  getDetail:function(){
    var that = this;
    wx.request({
      url: app.globalData.server + 'shop/web/detail',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        s_id: this.data.s_id
      },
      success: function (res) {
        console.log(res);
        that.setData({
          shop:res.data.data
        })
      }
    })
  },
  getGoods: function () {
    var that = this;
    wx.request({
      url: app.globalData.server + 'good/goods',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        s_id: this.data.s_id
      },
      success: function (res) {
        console.log(res);
        that.setData({
          goods: res.data.data
        })
      }
    })
  },
  toMap:function(){
    wx.openLocation({
      latitude: (this.data.shop.s_latitude-0),
      longitude: (this.data.shop.s_longitude - 0),
      name:this.data.shop.s_name,
      address:this.data.shop.s_address
    })
  },
  call:function(e){
    var phone=e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      fail:function(){
        wx.showToast({
          title: '拨打电话失败，请重试!',
          icon:'none'
        })
      }
    })
  },
  previewLogo(event) {
    console.log(event.currentTarget.dataset.src)
    let currentUrl = event.currentTarget.dataset.src;
    let arr = new Array(this.data.shop.s_logo);
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: arr // 需要预览的图片http链接列表
    })
  },
  //预览图片，放大预览
  preview(event) {
    console.log(event.currentTarget.dataset.src)
    let currentUrl = event.currentTarget.dataset.src;
    let sps=this.data.shop.shopPhotos;
    let urlss=new Array();
    for(let i=0;i<sps.length;i++){
      urlss.push(sps[i].sp_img);
    }
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: urlss // 需要预览的图片http链接列表
    })
  },
  showVideo:function(){
    this.setData({
      showTabV:true,
      showTabP:false,
      showTabI:false
    })
  },
  showPhoto:function(){
    this.setData({
      showTabV:false,
      showTabP:true,
      showTabI:false
    })
  },
  showInfo:function(){
    this.setData({
      showTabV:false,
      showTabP:false,
      showTabI:true
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
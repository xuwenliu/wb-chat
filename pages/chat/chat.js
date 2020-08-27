// pages/chat/chat.js

import TIM from '../../sdk/tim-wx';
import {
  SDKAPPID,
  genTestUserSig
} from '../../sdk/GenerateTestUserSig';


const app = getApp();
var inputVal = '';
var msgList = [];
var windowWidth = wx.getSystemInfoSync().windowWidth;
var windowHeight = wx.getSystemInfoSync().windowHeight;
var keyHeight = 0;

/**
 * 初始化数据
 */
function initData(that) {
  inputVal = '';

  msgList = [{
      speaker: 'server',
      contentType: 'text',
      content: '欢迎来到英雄联盟，敌军还有30秒到达战场，请做好准备！'
    },
    {
      speaker: 'customer',
      contentType: 'text',
      content: '我怕是走错片场了...'
    }
  ]
  that.setData({
    msgList,
    inputVal
  })
}

/**
 * 计算msg总高度
 */
function calScrollHeight(that, keyHeight) {
  var query = wx.createSelectorQuery();
  query.select('.scrollMsg').boundingClientRect(function (rect) {}).exec();
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: '',
    tim: null,
    scrollHeight: '100vh',
    inputBottom: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const {
      userId,
      avatar
    } = options;
    console.log('options', options)
    this.setData({
      avatar,
      tim: TIM.create({
        SDKAppID: SDKAPPID
      })
    })
    // this.data.tim.login({
    //   userID: userId,
    //   userSig: genTestUserSig(userId)
    // }).then((imResponse) => {
    //   console.log(imResponse.data); // 登录成功
    //   if (imResponse.data.repeatLogin === true) {
    //     // 标识账号已登录，本次登录操作为重复登录。v2.5.1 起支持
    //     console.log(imResponse.data.errorInfo);
    //   }
    // }).catch((imError) => {
    //   console.warn('login error:', imError); // 登录失败的相关信息
    // });

    initData(this);
    this.setData({
      cusHeadIcon: app.globalData.userInfo.avatarUrl,
      toView: 'msg-' + (msgList.length - 1)
    });

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
   * 获取聚焦
   */
  focus(e) {
    keyHeight = e.detail.height;
    this.setData({
      scrollHeight: (windowHeight - keyHeight) + 'px'
    });
    this.setData({
      toView: 'msg-' + (msgList.length - 1),
      inputBottom: keyHeight + 'px'
    })
    //计算msg高度
    // calScrollHeight(this, keyHeight);

  },

  //失去聚焦(软键盘消失)
  blur(e) {
    this.setData({
      scrollHeight: '100vh',
      inputBottom: 0
    })
    this.setData({
      toView: 'msg-' + (msgList.length - 1)
    })

  },

  /**
   * 发送点击监听
   */
  sendClick(e) {
    msgList.push({
      speaker: 'customer',
      contentType: 'text',
      content: e.detail.value
    })
    inputVal = '';
    this.setData({
      msgList,
      inputVal
    });
  },

  // 加入黑名单
  addBlackList() {

  }


})
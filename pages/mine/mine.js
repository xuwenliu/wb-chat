//mine.js
import config from '../../utils/config';

import {
  mGetMessageList
} from '../../utils/actions';
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    u_role:0,
    u_account:null,
    messageCount: 0
  },
  login:function(){
    var that=this;
    // 登录
    wx.login({
      success: res => {
        if(res.code){
          wx.request({
            url: app.globalData.server+'user/web/login',
            header:{
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data:{
              code:res.code
            },
            success:function(res1){
              if(res1.data.code==0){
                app.globalData.u_account = res1.data.data.u_account;
                config.TOKEN = res1.data.data.u_account;
                if(res1.data.data.nickName==null){
                  console.log("第一次");
                  wx.getUserInfo({
                    lang:"zh_CN",
                    withCredentials:true,
                    complete: (res2) => {
                      wx.request({
                        url: app.globalData.server+'user/web/updateInfo',
                        header:{
                          'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data:{
                          u_account:res1.data.data.u_account,
                          nickName:res2.userInfo.nickName,
                          avatarUrl:res2.userInfo.avatarUrl,
                          gender:res2.userInfo.gender, //性别 0：未知、1：男、2：女
                          province:res2.userInfo.province,
                          city:res2.userInfo.city,
                          country:res2.userInfo.country
                        },
                        success:function(res3){
                          if(res3.data.code==0){
                            that.setData({
                              userInfo:res2.userInfo,
                              u_account:res1.data.data.u_account,
                              u_role:res1.data.data.u_role,
                              hasUserInfo: true
                            });
                            console.log(res2.userInfo);
                            app.globalData.userInfo = res2.userInfo;
                            app.globalData.u_account=res1.data.data.u_account;
                            app.globalData.u_role=res1.data.data.u_role;
                            console.log("gg1="+app.globalData.u_account+",uu="+app.globalData.u_role);
                            that.setStorageFun();
                          }else{
                            wx.showToast({
                              icon:"none",
                              title: '登录失败，请重试',
                            })
                          }
                        },
                        error:function(e){
                          wx.showToast({
                            icon:"none",
                            title: '登录失败，请重试',
                          })
                        }
                      })
                    },
                  })
                }else{
                  console.log("不是第一次");
                  app.globalData.userInfo = res1.data.data;
                  app.globalData.u_account=res1.data.data.u_account;
                  app.globalData.u_role=res1.data.data.u_role;
                  console.log("不是第一次11");
                  that.setData({
                    userInfo: res1.data.data,
                    u_account:res1.data.data.u_account,
                    u_role:res1.data.data.u_role,
                    hasUserInfo: true
                  });
                  console.log("gg2="+app.globalData.u_account+",uu="+app.globalData.u_role);
                  that.setStorageFun();
                }
              }
            },
            error:function(){
              console.log("登录失败2")
            }
          })
        }else{
          console.log("登录失败1")
        }
      }
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      console.log(app.globalData.userInfo)
      this.setData({
        userInfo: app.globalData.userInfo,
        u_account:app.globalData.u_account,
        u_role:app.globalData.u_role,
        hasUserInfo: true
      });
      console.log("gg="+app.globalData.u_account+",uu="+app.globalData.u_role)
      this.getMessageList();
    } 
  },
  onShow(){
    // 判断是消息页面返回 刷新当前列表
    console.log(app.globalData.pageName)
    if (app.globalData.userInfo) {
      this.getMessageList();
    } 
    if (app.globalData.pageName == 'message') {
      this.getMessageList();
      app.globalData.pageName = '';
    }
  },
  // 获取消息列表
  async getMessageList() {
    let res = await mGetMessageList({});
    this.setData({
      messageCount: res.data.length
    })

  },
  setStorageFun:function(){
    console.log('111')
    wx.setStorage({
      data: app.globalData.userInfo,
      key: 'userInfo',
    });
    wx.setStorage({
      data: app.globalData.u_account,
      key: 'u_account',
    });
    wx.setStorage({
      data: app.globalData.u_role,
      key: 'u_role',
    });
  },
  applyShopKeeper:function(){
    wx.navigateTo({
      url: '../addShopKeeper/addShopKeeper',
    })
  },

  // 跳转消息列表
  handlerSwitchMessage(){
    wx.navigateTo({
      url: '../message/message',
    })
  },

  /**
   * 跳转帖子列表
   * @param {type} 1 => 我的动态; 2 => 我评价的帖子; 3 => 我点赞的帖子
   */
  handlerSwitchTopicList(e){
    if (!app.globalData.u_account) {
      wx.showToast({
        icon: 'none',
        title: '请先登录',
      })
      return;
    }
    let listType = e.currentTarget.dataset.listtype;
    wx.navigateTo({
      url: `../topicList/topicList?listType=${listType}`,
    })
  },
})

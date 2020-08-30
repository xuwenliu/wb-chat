import TIM from "../../sdk/tim-wx";
import COS from "../../sdk/cos-wx-sdk-v5";
import {
  SDKAPPID,
  genTestUserSig
} from "../../sdk/GenerateTestUserSig";
const app = getApp();

export class Chat {

  // 接受 需要登录的用户userId和接受消息的回调函数
  constructor(userId, messageReceived) {
    this.userId = userId;
    this.messageReceived = messageReceived;
    this.tim = TIM.create({
      SDKAppID: SDKAPPID,
    });
    this.init();
  }

  init() {
    this.tim.setLogLevel(0);
    this.tim.registerPlugin({
      "cos-wx-sdk": COS
    });
    // 把tim，TIM挂载到wx上
    wx.tim = this.tim;
    wx.TIM = TIM;
    this.login(); // 调用登录IM
    this.tim.on(TIM.EVENT.SDK_READY, onReadyStateUpdate);
    this.tim.on(TIM.EVENT.SDK_NOT_READY, onReadyStateUpdate);
    // 出错统一处理
    this.tim.on(TIM.EVENT.ERROR, onError);
    this.messageReceived && this.tim.on(TIM.EVENT.MESSAGE_RECEIVED, this.messageReceived);
    this.tim.on(TIM.EVENT.NET_STATE_CHANGE, netStateChange);

    function onReadyStateUpdate({
      name
    }) {
      const isSDKReady = name === TIM.EVENT.SDK_READY;
      // SDK已经 ready 则通知调用监听isSDKReady的地方，继续后续操作。
      getApp().globalData.isSDKReady = isSDKReady; 
    }

    function onError(event) {
      // 网络错误不弹toast && sdk未初始化完全报错
      if (
        event.data.message &&
        event.data.code &&
        event.data.code !== 2800 &&
        event.data.code !== 2999
      ) {
        wx.showToast({
          icon: "none",
          title: event.data.message,
          duration: 2000,
        });
      }
    }

    function checkoutNetState(state) {
      switch (state) {
        case TIM.TYPES.NET_STATE_CONNECTED:
          return {
            icon: "none", title: "已接入网络", duration: 2000
          };
        case TIM.TYPES.NET_STATE_CONNECTING:
          return {
            icon: "none", title: "当前网络不稳定", duration: 2000
          };
        case TIM.TYPES.NET_STATE_DISCONNECTED:
          return {
            icon: "none", title: "当前网络不可用", duration: 2000
          };
        default:
          return "";
      }
    }

    function netStateChange(event) {
      wx.showToast(checkoutNetState(event.data.state));
    }
  }
  login() {
    this.tim
      .login({
        userID: this.userId,
        userSig: genTestUserSig(this.userId).userSig,
      })
      .then((imResponse) => {
        console.log(imResponse.data); // 登录成功
        if (imResponse.data.repeatLogin === true) {
          // 标识账号已登录，本次登录操作为重复登录。v2.5.1 起支持
          wx.hideLoading();
          console.log(imResponse.data.errorInfo);
        }
      })
      .catch((imError) => {
        console.warn("login error:", imError); // 登录失败的相关信息
      });
  }
}
import TIM from "../../sdk/tim-wx";
import COS from "../../sdk/cos-wx-sdk-v5";
import { SDKAPPID } from "../../sdk/GenerateTestUserSig";

export const initChat = (messageReceived) => {
  const tim = TIM.create({
    SDKAppID: SDKAPPID,
  });
  tim.setLogLevel(0);
  wx.tim = tim;
  wx.TIM = TIM;
  wx.tim.registerPlugin({ "cos-wx-sdk": COS });

  tim.on(TIM.EVENT.SDK_READY, onReadyStateUpdate, this);
  tim.on(TIM.EVENT.SDK_NOT_READY, onReadyStateUpdate, this);

  // 出错统一处理
  tim.on(TIM.EVENT.ERROR, onError, this);
  tim.on(TIM.EVENT.MESSAGE_RECEIVED, messageReceived, this);

  // tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, convListUpdate, this);
  // tim.on(TIM.EVENT.BLACKLIST_UPDATED, blackListUpdate, this);
  tim.on(TIM.EVENT.NET_STATE_CHANGE, netStateChange, this);
  // tim.on(TIM.EVENT.MESSAGE_READ_BY_PEER, onMessageReadByPeer); // 消息是否已读

  function onReadyStateUpdate({ name }) {
    const isSDKReady = name === TIM.EVENT.SDK_READY;
    if (isSDKReady) {
      wx.tim.getMyProfile().then((res) => {
        // store.commit("updateMyInfo", res.data);
      });
      wx.tim.getBlacklist().then((res) => {
        // store.commit("setBlacklist", res.data);
      });
    }
    // store.commit("setSdkReady", isSDKReady);
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
        return { icon: "none", title: "已接入网络", duration: 2000 };
      case TIM.TYPES.NET_STATE_CONNECTING:
        return { icon: "none", title: "当前网络不稳定", duration: 2000 };
      case TIM.TYPES.NET_STATE_DISCONNECTED:
        return { icon: "none", title: "当前网络不可用", duration: 2000 };
      default:
        return "";
    }
  }

  function netStateChange(event) {
    wx.showToast(checkoutNetState(event.data.state));
  }
};

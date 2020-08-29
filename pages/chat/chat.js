import {
  emojiName,
  emojiMap,
  emojiUrl
} from "./emojiMap";
import config from "../../utils/config";
import QQMapWX from "../../utils/qqmap-wx-jssdk.min";
import {
  Chat
} from "./init";
import {
  decodeElement
} from "./decodeElement";

let qqmapsdk;
const app = getApp();

let windowWidth = wx.getSystemInfoSync().windowWidth;
let windowHeight = wx.getSystemInfoSync().windowHeight;
let keyHeight = 0;

const audioContext = wx.createInnerAudioContext();
const recorderManager = wx.getRecorderManager();
const recordOptions = {
  duration: 60000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: "aac", // 音频格式，选择此格式创建的音频消息，可以在即时通信 IM 全平台（Android、iOS、微信小程序和Web）互通
};

Page({
  data: {
    isSDKReady: false,
    userId: "", //发给谁的userId
    avatar: "", // 发送给谁的头像
    msgList: [],
    messageContent: "", // 用户输入的文本内容
    scrollHeight: "100vh",
    inputBottom: 0,

    // 录音相关
    isRecord: false,
    isRecording: false,
    canSend: true,
    startPoint: 0,
    title: "正在录音",

    // emoji相关
    emojiName: emojiName,
    emojiMap: emojiMap,
    emojiUrl: emojiUrl,
    isFocus: false,
    isEmojiOpen: false,

    //更多相关
    isMoreOpen: false,

    //位置相关
    location: {
      latitude: "",
      longitude: "",
      markers: {},
      address: "",
    },
  },

  watch: {
    isSDKReady(newValue) {
      if (!newValue) {
        return;
      }
      wx.hideLoading();
      wx.tim
        .updateMyProfile({
          nick: app.globalData.userInfo.nickName,
          avatar: app.globalData.userInfo.avatarUrl,
        })
    },
  },

  onLoad(options) {

    const {
      userId,
      avatar
    } = options;


    this.setData({
      avatar,
      userId,
      cusHeadIcon: app.globalData.userInfo.avatarUrl,
      toView: "msg-" + (this.data.msgList.length - 1),
    });

    // 用户地址解析
    qqmapsdk = new QQMapWX({
      key: config.QQ_MAP_KEY,
    });

    recorderManager.onStart(() => {
      console.log("recorder start");
    });
    recorderManager.onPause(() => {
      console.log("recorder pause");
    });
    recorderManager.onStop((res) => {
      console.log("recorder stop");
      wx.hideLoading();
      if (this.data.canSend) {
        if (res.duration < 1000) {
          wx.showToast({
            title: "录音时间太短",
            icon: "none",
          });
        } else {
          console.log(res);
          wx.showLoading();
          const message = wx.tim.createAudioMessage({
            to: this.data.userId,
            conversationType: wx.TIM.TYPES.CONV_C2C,
            payload: {
              file: res,
            },
          });

          wx.tim
            .sendMessage(message)
            .then((imResponse) => {
              this.sendMessageToView(message);
              wx.hideLoading();
              this.handleClose();
              console.log("语音发送成功", imResponse);
            })
            .catch((imError) => {
              console.log("语音发送失败", imError);
              wx.showToast({
                title: "语音发送失败",
                icon: "none",
              });
              wx.hideLoading();
            });
        }
      }
    });


  },
  onShow() {
    if (!this.data.isSDKReady) {
      wx.showLoading({
        title: "正在同步数据",
        mask: true
      });
    }
    app.setWatcher(this.data, this.watch); // 设置监听
    // 初始化并登录IM
    new Chat(this, app.globalData.userInfo.u_account, this.messageReceived);
  },
  onHide() {},
  onUnload() {
    // 从聊天列表进来则返回就不退出登录
    // 从私信进来则返回要退出登录
    if (app.globalData.pageName !== 'chatList') {
      wx.tim.logout();
    }
  },

  // 监听消息接收
  messageReceived(event) {
    console.log("监听消息接收", event);
    this.sendMessageToView(event.data[0]);
  },


  /**
   * 获取聚焦
   */
  focus(e) {
    keyHeight = e.detail.height;
    this.setData({
      isFocus: true,
      scrollHeight: windowHeight - keyHeight + "px",
    });
    this.setData({
      toView: "msg-" + (this.data.msgList.length - 1),
      inputBottom: keyHeight + "px",
    });
  },

  //失去聚焦(软键盘消失)
  blur(e) {
    this.setData({
      scrollHeight: "100vh",
      inputBottom: 0,
      isFocus: false,
    });
    this.setData({
      toView: "msg-" + (this.data.msgList.length - 1),
    });
  },

  contentChange(e) {
    this.setData({
      messageContent: e.detail.value,
    });
  },

  // 长按录音，监听在页面最外层view
  handleLongPress(e) {
    console.log(e);
    this.setData({
      startPoint: e.touches[0],
    });
    if (
      e.target.id === "say0" ||
      e.target.id === "say1" ||
      e.target.id === "say2"
    ) {
      this.setData({
        title: "正在录音",
        isRecording: true,
        canSend: true,
      });
      this.startRecording();
    }
  },

  // 录音时的手势上划移动距离对应文案变化
  handleTouchMove(e) {
    if (this.data.isRecording) {
      if (
        this.data.startPoint.clientY - e.touches[e.touches.length - 1].clientY >
        100
      ) {
        this.setData({
          title: "松开手指，取消发送",
          canSend: false,
        });
      } else if (
        this.data.startPoint.clientY - e.touches[e.touches.length - 1].clientY >
        20
      ) {
        this.setData({
          title: "上划可取消",
          canSend: true,
        });
      } else {
        this.setData({
          title: "正在录音",
          canSend: true,
        });
      }
    }
  },

  // 手指离开页面滑动
  handleTouchEnd() {
    this.setData({
      isRecording: false,
    });
    wx.hideLoading();
    recorderManager.stop();
  },

  // 切换录音按钮
  chooseRecord() {
    this.setData({
      isRecord: !this.data.isRecord,
    });
  },
  // 开始录音之前要判断一下是否开启权限
  startRecording() {
    wx.getSetting({
      success: (res) => {
        let auth = res.authSetting["scope.record"];
        if (auth === false) {
          // 已申请过授权，但是用户拒绝
          wx.openSetting({
            success: function (res) {
              let auth = res.authSetting["scope.record"];
              if (auth === true) {
                wx.showToast({
                  title: "授权成功",
                  icon: "success",
                  duration: 1500,
                });
              } else {
                wx.showToast({
                  title: "授权失败",
                  icon: "none",
                  duration: 1500,
                });
              }
            },
          });
        } else if (auth === true) {
          // 用户已经同意授权
          this.setData({
            isRecording: true,
          });
          recorderManager.start(recordOptions);
        } else {
          // 第一次进来，未发起授权
          wx.authorize({
            scope: "scope.record",
            success: () => {
              wx.showToast({
                title: "授权成功",
                icon: "success",
                duration: 1500,
              });
            },
          });
        }
      },
      fail: function () {
        wx.showToast({
          title: "授权失败",
          icon: "none",
          duration: 1500,
        });
      },
    });
  },

  // 播放音频
  openAudio(e) {
    audioContext.src = e.currentTarget.dataset.url;
    audioContext.play();
    audioContext.onPlay(() => {});
    audioContext.onEnded(() => {
      wx.hideToast();
    });
    audioContext.onError(() => {
      wx.showToast({
        title: "小程序暂不支持播放该音频格式",
        icon: "none",
        duration: 2000,
      });
    });
  },

  // 视频播放出错
  videoError(e) {
    console.log(e);
    wx.showToast({
      icon: "none",
      title: `视频出现错误，错误信息${e.detail.errMsg}`,
      duration: 1500,
    });
  },

  // 表情按钮切换
  handleEmoji() {
    if (this.data.isFocus) {
      this.setData({
        isFocus: false,
        isMoreOpen: false,
        isEmojiOpen: true,
      });
    } else {
      this.setData({
        isMoreOpen: false,
        isEmojiOpen: !this.data.isEmojiOpen,
      });
    }
  },

  // 发消息选中emoji
  chooseEmoji(e) {
    this.setData({
      messageContent: this.data.messageContent + e.currentTarget.dataset.emoji,
    });
  },

  isNull(content) {
    if (content === "") {
      return true;
    }
    const reg = "^[ ]+$";
    const re = new RegExp(reg);
    return re.test(content);
  },

  // 处理更多选项卡
  handleMore() {
    if (this.data.isFocus) {
      this.setData({
        isFocus: false,
        isEmojiOpen: false,
        isMoreOpen: true,
      });
    } else {
      this.setData({
        isMoreOpen: !this.data.isMoreOpen,
        isEmojiOpen: false,
      });
    }
  },

  // 发送text + emoji
  sendMessage() {
    if (!this.isNull(this.data.messageContent)) {
      wx.showLoading();
      const message = wx.tim.createTextMessage({
        to: this.data.userId, //发给谁
        conversationType: wx.TIM.TYPES.CONV_C2C,
        payload: {
          text: this.data.messageContent,
        },
      });
      wx.tim
        .sendMessage(message)
        .then((imResponse) => {
          this.sendMessageToView(message);
          wx.hideLoading();
          this.setData({
            messageContent: "",
          });
          console.log("发送成功", imResponse);
        })
        .catch((imError) => {
          console.log("发送失败", imError);
          wx.showToast({
            title: "消息发送失败",
            icon: "none",
          });
          wx.hideLoading();
        });
    } else {
      wx.showToast({
        title: "消息不能为空",
      });
    }
    this.setData({
      isFocus: false,
      isEmojiOpen: false,
      isMoreOpen: false,
    });
  },

  // 发送图片
  sendPhoto() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        wx.showLoading();
        const message = wx.tim.createImageMessage({
          to: this.data.userId,
          conversationType: wx.TIM.TYPES.CONV_C2C,
          payload: {
            file: res,
          },
          onProgress: (percent) => {
            console.log("上传进度", percent);
          },
        });
        wx.tim
          .sendMessage(message)
          .then((imResponse) => {
            this.sendMessageToView(message);
            wx.hideLoading();
            this.handleClose();
            console.log("发送成功", imResponse);
          })
          .catch((imError) => {
            console.log("发送失败", imError);
            wx.showToast({
              title: "图片发送失败",
              icon: "none",
            });
            wx.hideLoading();
          });
      },
    });
  },

  // 发送视频
  sendVideo() {
    wx.chooseVideo({
      sourceType: ["album", "camera"],
      maxDuration: 60,
      camera: "back",
      success: (res) => {
        wx.showLoading();
        const message = wx.tim.createVideoMessage({
          to: this.data.userId,
          conversationType: wx.TIM.TYPES.CONV_C2C,
          payload: {
            file: res,
          },
        });

        wx.tim
          .sendMessage(message)
          .then((imResponse) => {
            this.sendMessageToView(message);
            wx.hideLoading();
            console.log("发送成功", imResponse);
            this.handleClose();
          })
          .catch((imError) => {
            wx.showToast({
              title: "视频发送失败",
              icon: "none",
            });
            wx.hideLoading();
            console.log("发送失败", imError);
          });
      },
    });
  },

  // 发送位置
  sendLocation() {
    wx.getLocation({
      type: "gcj02",
      success: async (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        // 构建标注
        let marker = {
          id: 1,
          latitude: latitude,
          longitude: longitude,
          width: 50,
          height: 50,
        };
        let markers = new Array();
        markers.push(marker);
        const address = await this.getAddress(marker);

        wx.showLoading();
        const message = wx.tim.createCustomMessage({
          to: this.data.userId,
          conversationType: wx.TIM.TYPES.CONV_C2C,
          payload: {
            data: latitude.toString(),
            description: longitude.toString(),
            extension: address,
          },
        });

        wx.tim
          .sendMessage(message)
          .then((imResponse) => {
            this.sendMessageToView(message);
            wx.hideLoading();
            console.log("发送成功", imResponse);
            this.handleClose();
          })
          .catch((imError) => {
            wx.showToast({
              title: "位置发送失败",
              icon: "none",
            });
            wx.hideLoading();
            console.log("发送失败", imError);
          });
      },
    });
  },

  // 选项卡关闭
  handleClose() {
    this.setData({
      isFocus: false,
      isMoreOpen: false,
      isEmojiOpen: false,
    });
  },

  // 图片预览
  previewImage(e) {
    const image = e.currentTarget.dataset.image;
    wx.previewImage({
      urls: [image],
      current: image,
    });
  },

  // 位置预览
  viewLocation(e) {
    const {
      latitude,
      longitude,
      address
    } = e.currentTarget.dataset;
    wx.openLocation({
      latitude: +latitude,
      longitude: +longitude,
      address,
      scale: 18,
    });
  },

  // 地址逆解析
  getAddress(location) {
    return new Promise((resolve, reject) => {
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        success: function (res) {
          let address = res.result.address;
          resolve(address);
        },
      });
    });
  },

  // 发送消息到页面上
  sendMessageToView(message) {
    message.virtualDom = decodeElement(message);
    this.setData({
      msgList: [...this.data.msgList, message],
    });
  },

  // 加入黑名单
  addBlackList() {
    wx.tim
      .addToBlacklist({
        userIDList: [this.data.userId],
      })
      .then((imResponse) => {
        wx.showToast({
          title: "加入黑名单成功",
          icon: "none",
        });
      })
      .catch((imError) => {
        wx.showToast({
          title: "加入黑名单失败",
          icon: "none",
        });
      });
  },
});
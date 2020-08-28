// pages/chat/chat.js
import { genTestUserSig } from "../../sdk/GenerateTestUserSig";
import { emojiName, emojiMap, emojiUrl } from "./emojiMap";
import config from "../../utils/config";
import QQMapWX from "../../utils/qqmap-wx-jssdk.min";
import { initChat } from "./init";
import { decodeElement } from "./decodeElement";

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

  onLoad(options) {
    const { userId, avatar } = options;
    initChat(this.messageReceived);
    wx.tim
      .login({
        userID: userId,
        userSig: genTestUserSig(userId).userSig,
      })
      .then((imResponse) => {
        console.log(imResponse.data); // 登录成功
        if (imResponse.data.repeatLogin === true) {
          // 标识账号已登录，本次登录操作为重复登录。v2.5.1 起支持
          console.log(imResponse.data.errorInfo);
        }
      })
      .catch((imError) => {
        console.warn("login error:", imError); // 登录失败的相关信息
      });

    this.setData({
      avatar,
      userId,
      cusHeadIcon: app.globalData.userInfo.avatarUrl,
      toView: "msg-" + (this.data.msgList.length - 1),
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
          });
        } else {
          console.log(res);
          sendMessageToView(this, {
            self: true,
            type: TIM.TYPES.MSG_AUDIO,
            sendAvatar: app.globalData.userInfo.avatarUrl,
            sendDate: new Date(),
            duration: Math.ceil(res.duration / 1000),
            url: res.tempFilePath,
          });
          // const message = this.data.tim.createAudioMessage({
          //   to: this.$store.getters.toAccount,
          //   conversationType: this.$store.getters.currentConversationType,
          //   payload: {
          //     file: res,
          //   },
          // });
          // this.$store.commit("sendMessage", message);
          // wx.$app.sendMessage(message);
        }
      }
    });

    qqmapsdk = new QQMapWX({
      key: config.QQ_MAP_KEY,
    });
  },

  // 监听消息接收
  messageReceived(event) {
    console.log("messageReceived", event);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

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

  // 长按录音，监听在页面最外层view，如果是放在button的话，手指上划离开button后获取距离变化有bug
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
  openAudio(audio) {
    audioContext.src = audio.url;
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

  // 发送text message 包含 emoji
  sendMessage() {
    if (!this.isNull(this.data.messageContent)) {
      const message = wx.tim.createTextMessage({
        to: this.data.userId, //发给谁
        conversationType: wx.TIM.TYPES.CONV_C2C,
        payload: {
          text: this.data.messageContent,
        },
      });
      console.log("message", message);
      wx.tim
        .sendMessage(message)
        .then((imResponse) => {
          this.sendMessageToView(message);
          console.log("发送成功", imResponse);
        })
        .catch((imError) => {
          console.log("发送失败", imError);
        });
      this.setData({
        messageContent: "",
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

  // 发送图片
  sendPhoto() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        console.log(res);
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
            console.log("发送成功", imResponse);
          })
          .catch((imError) => {
            console.log("发送失败", imError);
          });
        this.handleClose();
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
        // let message = wx.$app.createVideoMessage({
        //   to: that.$store.getters.toAccount,
        //   conversationType: that.$store.getters.currentConversationType,
        //   payload: {
        //     file: res,
        //   },
        // });
        // that.$store.commit("sendMessage", message);
        // wx.$app.sendMessage(message);
        this.handleClose();
      },
    });
  },

  // 发送位置
  sendLocation() {
    wx.getLocation({
      type: "gcj02",
      success: async (res) => {
        console.log(res);
        const latitude = res.latitude;
        const longitude = res.longitude;
        const speed = res.speed;
        const accuracy = res.accuracy;
        // TODO 需要转换就得引入腾讯地图服务
        // https://lbs.qq.com/miniProgram/jsSdk/jsSdkGuide/jsSdkOverview
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

        this.setData({
          location: {
            latitude: latitude,
            longitude: longitude,
            markers: markers,
            address,
          },
        });
        this.handleClose();
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
    const { latitude, longitude, address } = e.currentTarget.dataset;
    wx.openLocation({
      latitude,
      longitude,
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
  // 加入黑名单
  addBlackList() {},
  sendMessageToView(message) {
    message.virtualDom = decodeElement(message);
    let date = new Date(message.time * 1000);
    console.log("sendMessageToView", message);
    // message.newtime = formatTime(date)

    this.setData({
      msgList: [...this.data.msgList, message],
    });
  },
});

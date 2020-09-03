import {
  emojiName,
  emojiMap,
  emojiUrl
} from "../../utils/emojiMap";
import {
  Chat
} from "../../utils/im";
import {
  decodeElement
} from "../../utils/decodeElement";
import {
  throttle,
  filterDate
} from "../../utils/util";

const app = getApp();
let that = null;

const windowHeight = wx.getSystemInfoSync().windowHeight;
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
    isShow: false,
    currentConversationID: "",
    nextReqMessageID: "",
    isCompleted: false, // 当前会话消息是否已经请求完毕
    isLoading: false, // 是否正在请求

    userId: "", //发给谁的userId
    avatar: "", // 发送给谁的头像
    msgList: [],
    messageContent: "", // 用户输入的文本内容

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
      that.initAction();
    },
  },

  initAction() {
    wx.tim.updateMyProfile({
      nick: app.globalData.userInfo.nickName,
      avatar: app.globalData.userInfo.avatarUrl,
    });
    //如果是私聊进来则需要手动获取 会话ID
    if (app.globalData.pageName !== "chatList") {
      wx.tim.getConversationList().then((imResponse) => {
        const conversationList = imResponse.data.conversationList;
        if (conversationList.length > 0) {
          const userId = this.data.userId;
          conversationList.forEach((item) => {
            if (item.userProfile.userID === userId) {
              this.setData({
                currentConversationID: item.conversationID,
              });
            }
          });
          this.getMessageList();
        }
      });
    } else {
      this.getMessageList();
    }
    this.scrollToBottom();
  },

  onLoad(options) {
    that = this;
    const {
      userId,
      avatar,
      currentConversationID
    } = options;

    this.setData({
      avatar,
      userId,
      cusHeadIcon: app.globalData.userInfo.avatarUrl,
      currentConversationID,
      nextReqMessageID: "", // 第一次没有下一个
    });

    app.setWatcher(app.globalData, this.watch); // 设置监听

    console.log("app.globalData.isSDKReady", app.globalData.isSDKReady);

    // 如果已经登录IM了则不再登录
    if (app.globalData.isSDKReady) {
      this.initAction();
    } else {
      // 初始化并登录IM
      wx.showLoading({
        mask: true,
      });
    }
    new Chat(app.globalData.userInfo.u_account, this.messageReceived);

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
          wx.showLoading({
            mask: true,
          });
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
              this.sendMessageToView([message]);
              wx.hideLoading();
              this.handleClose();
            })
            .catch((imError) => {
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
    this.setData({
      isShow: true,
    });
  },
  onHide() {},
  onUnload() {
    this.setData({
      isShow: false,
    });
    wx.tim.logout();
  },
  onPullDownRefresh() {
    throttle(() => {
      this.getMessageList(true)
    }, 1000)();
  },

  // 监听消息接收
  async messageReceived(event) {
    console.log("监听消息接收", event);
    this.sendMessageToView(event.data);
    // 同时设置会话为已读
    await wx.tim.setMessageRead({
      conversationID: this.data.currentConversationID,
    });
  },

  // 滚动到列表bottom
  scrollToBottom() {
    let query = wx.createSelectorQuery();
    let that = this;
    query
      .select("#chat")
      .boundingClientRect(function (res) {
        if (res) {
          if (res.bottom - windowHeight < 200) {
            if (that.data.isShow) {
              wx.pageScrollTo({
                scrollTop: 99999,
              });
            }
          }
        }

      })
      .exec();

    let interval = setInterval(() => {
      if (this.data.msgList.length !== 0) {
        if (this.data.isShow) {
          wx.pageScrollTo({
            scrollTop: 99999,
          });
        }
        clearInterval(interval);
      }
    }, 600);
  },

  unshiftMessageList(messageList) {
    let list = [...messageList];
    for (let i = 0; i < list.length; i++) {
      let message = list[i];
      list[i].virtualDom = decodeElement(message);
      list[i].newTime = filterDate(message.time);
    }
    return [...list];
  },

  // 获取消息列表
  getMessageList(isRefresh) {
    console.log(isRefresh)
    // 如果不存在当前会话ID则说明第一次与该人会话，则不需要获取消息列表。
    if (!this.data.currentConversationID) {
      wx.stopPullDownRefresh();
      return;
    }
    // 判断是否拉完了，isCompleted 的话要报一下没有更多了
    if (!this.data.isCompleted) {
      // 如果请求还没回来，又拉，此时做一下防御
      if (!this.data.isLoading) {
        this.setData({
          isLoading: true,
        });
        wx.tim
          .getMessageList({
            conversationID: this.data.currentConversationID,
            nextReqMessageID: this.data.nextReqMessageID,
            count: 15,
          })
          .then((res) => {
            console.log('res', res)
            this.sendMessageToView(res.data.messageList, true, isRefresh);
            this.setData({
              isCompleted: res.data.isCompleted,
              nextReqMessageID: res.data.nextReqMessageID,
              isLoading: false,
            });
            wx.stopPullDownRefresh();
          })
          .catch((err) => {});
      }
    } else {
      wx.showToast({
        title: "没有更多啦",
        icon: "none",
        duration: 1500,
      });
    }
  },

  /**
   * 获取聚焦
   */
  focus(e) {
    this.setData({
      isFocus: true,
    });
  },

  //失去聚焦(软键盘消失)
  blur(e) {
    this.setData({
      isFocus: false,
    });
  },

  contentChange(e) {
    this.setData({
      messageContent: e.detail.value,
    });
  },

  // 长按录音
  handleLongPress(e) {
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

  // 结束录音
  handleTouchEnd() {
    this.setData({
      isRecording: false,
      canSend: true,
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
    wx.pageScrollTo({
      scrollTop: 99999,
    });
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
    wx.pageScrollTo({
      scrollTop: 99999,
    });
  },

  // 发送text + emoji
  sendMessage() {
    if (!this.isNull(this.data.messageContent)) {
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
          this.sendMessageToView([message]);
          this.setData({
            messageContent: "",
          });
        })
        .catch((imError) => {
          wx.showToast({
            title: "消息发送失败",
            icon: "none",
          });
        });
    } else {
      wx.showToast({
        title: "消息不能为空",
        icon: "none",
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
      count: 9,
      success: (res) => {
        wx.showLoading({
          mask: true,
        });

        // 循环发送
        let sendArr = [];
        if (res.tempFiles.length > 1) {
          res.tempFiles.forEach((item) => {
            sendArr.push({
              errMsg: res.errMsg,
              tempFilePaths: [item.path],
              tempFiles: [item],
            });
          });
        } else {
          sendArr = [res];
        }
        sendArr.forEach((item) => {
          const message = wx.tim.createImageMessage({
            to: this.data.userId,
            conversationType: wx.TIM.TYPES.CONV_C2C,
            payload: {
              file: item,
            },
            onProgress: (percent) => {},
          });
          wx.tim
            .sendMessage(message)
            .then((imResponse) => {
              this.sendMessageToView([message]);
              wx.hideLoading();
              this.handleClose();
            })
            .catch((imError) => {
              wx.showToast({
                title: "图片发送失败",
                icon: "none",
              });
              wx.hideLoading();
            });
        });
        if (res.tempFiles) {}
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
        wx.showLoading({
          mask: true,
        });
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
            this.sendMessageToView([message]);
            wx.hideLoading();
            this.handleClose();
          })
          .catch((imError) => {
            wx.showToast({
              title: "视频发送失败",
              icon: "none",
            });
            wx.hideLoading();
          });
      },
    });
  },

  // 发送位置
  sendLocation() {
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        const {
          latitude,
          longitude
        } = res;
        wx.chooseLocation({
          latitude,
          longitude,
          success: (res) => {
            const message = wx.tim.createCustomMessage({
              to: this.data.userId,
              conversationType: wx.TIM.TYPES.CONV_C2C,
              // 这里将位置信息赋给以下3个变量，因为SDK只提供了这三个
              payload: {
                data: res.latitude.toString(),
                description: res.longitude.toString(),
                extension: res.address,
              },
            });
            wx.tim
              .sendMessage(message)
              .then(() => {
                this.sendMessageToView([message]);
                this.handleClose();
              })
              .catch((imError) => {
                wx.showToast({
                  title: "位置发送失败",
                  icon: "none",
                });
              });
          },
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

  // 发送消息到页面上
  sendMessageToView(messageArr, isGetList, isRefresh) {
    const unshiftMessageList = this.unshiftMessageList(messageArr);
    let msgList = [];
    if (isGetList) {
      msgList = [...unshiftMessageList, ...this.data.msgList];
    } else {
      msgList = [...this.data.msgList, ...unshiftMessageList];
    }
    this.setData({
      msgList,
    });
    if (isRefresh) {

    } else {
      this.scrollToBottom();
    }
  },

  // 加入黑名单
  addBlackList() {
    wx.tim
      .addToBlacklist({
        userIDList: [this.data.userId],
      })
      .then(() => {
        this.handleClose();
        wx.showToast({
          title: "加入黑名单成功",
          icon: "none",
        });
      })
      .catch(() => {
        wx.showToast({
          title: "加入黑名单失败",
          icon: "none",
        });
      });
  },
});
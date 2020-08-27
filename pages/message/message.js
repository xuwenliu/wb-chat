import {
  mGetMessageList,
  mAddChildComment,
  mCancelFollowUser,
  mFollowUser,
  mReadMessage
} from '../../utils/actions';

const app = getApp()

Page({
  data: {
    hideModal: true,
    messageList: [],
    message: '',
    senderNick: ''
  },
  dataPkId: '', // 评论id或者帖子id
  onLoad() {
    app.globalData.pageName = 'message';
    this.getMessageList();
  },

  // 获取消息列表
  async getMessageList(){
    let res = await mGetMessageList({});
    this.setData({
      messageList: res.data
    })
    res.data.length > 0 && res.data.map(item => {
      this.readMessage(item.msgId);
    })
  },

  // 消息置为已读
  async readMessage(msgId){
    await mReadMessage({
      msgId
    })
    .catch(err => console.log(err));

    console.log(`${msgId}消息已置为已读`);
  },

  //监听输入框
  handlerInputText(e){
    this.setData({
      message: e.detail.value
    })
  },

  // 显示遮罩层
  hanlderShowMessageDialog(e) {
    this.dataPkId = e.currentTarget.dataset.datapkid;
    this.setData({
      senderNick: e.currentTarget.dataset.sendernick
    })
    let animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    })
    this.setData({
      hideModal:false
    })
    animation.translateY(0).step();
    setTimeout(() => {
      this.setData({
        animationData: animation.export()
      })
    }, 100)
  },

  // 隐藏遮罩层
  handlerHideMessageDialog() {
    this.dataPkId = '';
    const animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    })
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),  
    })
    setTimeout(() => {
      this.setData({
        senderNick: '',
        hideModal:true
      })      
    },300)
    
  },

  // 发送消息
  async handlerSendMessage(){
    if(!this.data.message){
      wx.showToast({
        icon: 'none',
        title: '请输入消息文本'
      })
      return;
    }

    await mAddChildComment({
      commentId: this.dataPkId,
      text: this.data.message
    })

    wx.showToast({
      icon: 'success',
      title: '回复成功'
    })

    this.setData({
      message: ''
    })

    this.handlerHideMessageDialog();
  },

  // 查看用户信息
  handlerLookUser(e){
    let userId = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: `../userInfo/userInfo?userId=${userId}`
    })
  },

  // 关注取消关注
  async switchFollow(isFollow, senderId){
    let requestApi = isFollow ? mCancelFollowUser : mFollowUser;
    await requestApi({
      userId: senderId
    });
    return Promise.resolve(isFollow);
  },

  // 取消关注
  async handlerSwitchFollow(e){
    let isFollow = e.currentTarget.dataset.isfollow,
      senderId = e.currentTarget.dataset.senderid;
    await this.switchFollow(isFollow, senderId);
    if(isFollow){
      wx.showToast({
        icon: 'none',
        title: '取消关注成功',
        duration: 500
      })
    } else {
      wx.showToast({
        icon: 'success',
        title: '关注成功',
        duration: 500
      })
    }
    setTimeout(() => {
      this.getMessageList();
    }, 400)
  }
})
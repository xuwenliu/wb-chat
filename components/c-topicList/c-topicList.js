import {
  mDelTopic,
  mGetTopicList,
  mPraiseTopic,
  mCancelPraiseTopic,
  mAddComment,
  mDelComment,
  mGetCommentList,
  mGetReplyList,
  mAddChildComment,
  mDelCommentReply
} from '../../utils/actions';

import {
  getDistance
} from '../../utils/util';

let location = null;
let currentTopicLeg = 10;

Component({
  properties: {
    // 是否展示帖子列表
    showTopic: {
      type: Boolean,
      value: false
    },
    isSquare: {
      type: Boolean,
      value: false
    },
    // 当前登录的userid
    pageSize: {
      type: String,
      value: 10,
    },
    // 当前登录的userid
    pageNo: {
      type: Number,
      value: 1,
      observer(newVal, oldVal, changePath) {
        if (this.data.isRefresh){
          currentTopicLeg = 0;
          return;
        }
        console.log('111')
        if (currentTopicLeg < 10){
          this.triggerEvent('tellToBottom', true);
          return;
        }
        this.getTopicList();
      }
    },
    isRefresh: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal, changePath) {
        if(newVal){
          console.log('2222')
          currentTopicLeg = 10;
          this.getTopicList(true);
        }
        
      }
    },
    userId: {
      type: String,
      value: '',
    },
    // 当前登录的userid
    account: {
      type: String,
      value: '',
    },
    // 帖子类型
    listType: {
      type: String,
      value: '',
    },
    // 帖子分类
    topicType: {
      type: String,
      value: '',
      observer (newVal, oldVal, changePath) {
        if(!oldVal) return;
        this.getTopicList(true);
      }
    }
  },
  data: {
    topicList: [], // 帖子列表
    hideModal: true, //评论弹窗的状态  true-隐藏  false-显示
    animationData: {}, // 评论框动画
    commentList: [], // 评论列表
    commentText: '', // 评论的文本
    hideReplayModal: true,
    publisherNick: '', //要回复的用户名称
    animationReplyData: {}, // 回复框动画
    replyText: '', // 回复的文本
  },
  initPage: false, // onshow是不是执行过
  publisherId: '', //当前要要评论的帖子发布者
  topicId: '', // 要评论的帖子id
  commentId: '', //要评论的评论id

  // 生命周期
  lifetimes: {
    async attached() {
      location = await this.getUserLocation();
      this.getTopicList();
    },
    detached() {
      this.setData({
        showTopic: false
      });
    },
  },
  // 组件生命周期
  pageLifetimes: {
    async show() {
      
    },
    hide(){
      
    }
  },
  // 监听数据变化
  observers: {
    // 'topicType': function(val){
    //   if(this.initPage){
    //     this.getTopicList();
    //   }
    // }
  },
  methods: {
    // 提示登录
    showLoginInfo(){
      wx.showToast({
        icon: 'none',
        title: '请先登录',
      })
    },
    // 发帖入口
    handlerSwitchSendInvitation(){
      wx.navigateTo({
        url: '../sendTopic/sendTopic',
      })
    },

    // 点击删除帖子
    handlerDelTopic(e){
      let _this = this;
      let topicId = e.currentTarget.dataset.topicid,
      topicPublisherId = e.currentTarget.dataset.topicpublisherid;
      wx.showModal({
        title: '提示',
        content: '确定要删除该条帖子么？',
        confirmColor: '#EB9001',
        success(res){
          if(res.cancel) return;
          _this.delTopic(topicId, topicPublisherId);
        }
      })
    },

    // 删除帖子api
    async delTopic(topicId, topicPublisherId){
      await mDelTopic({
        topicId: topicId,
        topicPublisherId: topicPublisherId
      })

      let topicList = this.data.topicList,
        _index = 0;
      topicList.forEach((item, idx) => {
        if (item.topicId == topicId){
          _index = idx;
        }
      })
      
      topicList.splice(_index, 1);
      this.setData({
        topicList: topicList
      })
      wx.showToast({
        title: '删除成功'
      })
    },
    
    // 获取经纬度
    getUserLocation(){
      return new Promise((resolve, reject) => {
        wx.getLocation({
          type: 'wgs84',
          success(res){
            resolve({
              lat: res.latitude,
              lng: res.longitude
            })
          }
        })
      })
    },
    
    // 查看用户信息
    handlerLookUser(e){
      let userId = e.currentTarget.dataset.userid;
      wx.navigateTo({
        url: `../userInfo/userInfo?userId=${userId}`
      })
    },

    // 获取帖子列表
    async getTopicList(isRefresh){
      wx.showLoading({
        title: '加载中...'
      });
      let res = await mGetTopicList({
        topicType: this.data.topicType == '关注' ? '' : this.data.topicType,
        listType: this.data.listType,
        userId: this.data.userId,
        pageSize: this.data.pageSize,
        pageNo: this.data.pageNo
      })
      let topicList = this.data.topicList;
      currentTopicLeg = res.data.length;
      res.data.map((item, idx) => {
        let imagesList = [];
        if(item.images){
          imagesList = item.images.split(',');
        }
        item.distance = getDistance({
          lat: item.lat,
          lng: item.lng
        }, location);
        item.imagesList = imagesList;
      })

      if (isRefresh){
        topicList = res.data;
      } else {
        topicList = topicList.concat(res.data);
      }

      this.setData({
        topicList: topicList
      })
      if (isRefresh) {
        this.triggerEvent('tellRefreshEnd', true)
      } 
      wx.hideLoading()
    },

    // 更新帖子数据
    updateTopicList(res) {
      let topicList = this.data.topicList
      topicList.forEach((item, idx) => {
        if (item.topicId == res.data.topicId) {
          let imagesList = [];
          if (res.data.images) {
            imagesList = res.data.images.split(',');
          }
          res.data.distance = getDistance({
            lat: item.lat,
            lng: item.lng
          }, location);
          res.data.imagesList = imagesList;
          
          topicList.splice(idx, 1, res.data);
        }
      })
      this.setData({
        topicList: topicList
      })
    },

    // 点击图片进行大图查看
    LookPhoto(e) {
      wx.previewImage({
        current: e.currentTarget.dataset.photurl,
        urls: e.currentTarget.dataset.imageslist
      })
    },

    // 点赞 取消点赞
    async handlerPraise(e) {
      if(!this.data.account){
        this.showLoginInfo();
        return;
      }
      const isPrase = e.currentTarget.dataset.ispraise,
        topicId = e.currentTarget.dataset.topicid,
        publisherId = e.currentTarget.dataset.publisherid,
        cuurentTopicType = e.currentTarget.dataset.topictype;
      const requestApi = isPrase ? mCancelPraiseTopic : mPraiseTopic;
      let res = await requestApi({
        topicPublisherId: publisherId,
        topicType: cuurentTopicType,
        topicId
      })

      this.updateTopicList(res);
    },

    // 评论逻辑==================================
    // 显示评论遮罩层
    async hanlderShowCommentDialog(e) {
      if(!this.data.account){
        this.showLoginInfo();
        return;
      }
      if (this.data.isSquare){
        wx.hideTabBar();
      }
      this.topicId = e.currentTarget.dataset.topicid;
      this.publisherId = e.currentTarget.dataset.publisherid;
      this.cuurentTopicType = e.currentTarget.dataset.topictype;
      await this.getCommentList(this.topicId);

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
      }, 200)
    },

    // 隐藏评论遮罩层
    handlerHideCommentDialog() {
      this.topicId = '';
      this.publisherId = '';
      this.cuurentTopicType = '';
      const animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease'
      })
      animation.translateY(800).step()
      this.setData({
        animationData: animation.export(),  
      })
      setTimeout(() => {
        if (this.data.isSquare){
          wx.showTabBar();
        }
        this.setData({
          hideModal:true
        })      
      },300)
      
    },

    // 获取评论列表
    async getCommentList(topicId){
      let res = await mGetCommentList({
        topicId
      })

      let commentList = this.data.commentList;
      res.data.map(item => {
        item.children = [];
        item.showChild = false;

        let currentComment = null;
        if(commentList.length > 0){
          currentComment = commentList.find(i => {
            return i.commentId === item.commentId;
          })
        }
        if(currentComment){
          item.children = currentComment.children;
          item.showChild = currentComment.showChild;
        }
      })

      this.setData({
        commentList: res.data
      })

      return Promise.resolve(true);
    },

    // 获取评论文本
    handlerGetCommentText(e){
      this.setData({
        commentText: e.detail.value
      })
    },

    // 发表评论
    async handlerSendMessage(){
      if(!this.data.commentText){
        wx.showToast({
          icon: 'none',
          title: '请输入评论'
        })
        return;
      }
      
      let res = await mAddComment({
        topicId: this.topicId,
        text: this.data.commentText,
        topicPublisherId: this.publisherId,
        topicType: this.cuurentTopicType
      })

      wx.showToast({
        icon: 'success',
        title: '评论成功'
      })

      this.setData({
        commentText: ''
      })

      this.getCommentList(this.topicId);
      this.updateTopicList(res);
      
    },


    // 点击删除评论
    handlerDelComment(e) {
      let _this = this;
      let commentId = e.currentTarget.dataset.commentid;
      wx.showModal({
        title: '提示',
        content: '确定要删除该条评论么？',
        confirmColor: '#EB9001',
        success(res) {
          console.log(res)
          if (res.cancel) return;
          _this.delComment(commentId);
        }
      })
    },

    // 删除评论接口
    async delComment(commentId) {
      let res = await mDelComment({
        topicId: this.topicId,
        commentId
      })

      wx.showToast({
        title: '删除成功'
      })

      this.getCommentList(this.topicId);
      this.updateTopicList(res);
    },

    // 回复逻辑==================================
    // 显示回复遮罩层
    async hanlderReplyCommentDialog(e) {
      this.commentId = e.currentTarget.dataset.commentid;
      this.setData({
        publisherNick: e.currentTarget.dataset.publishernick
      })

      let animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease'
      })
      this.setData({
        hideReplayModal:false
      })
      animation.translateY(0).step();
      setTimeout(() => {
        this.setData({
          animationReplyData: animation.export()
        })
      }, 200)
    },

    // 隐藏回复遮罩层
    handlerHideReplyDialog() {
      this.commentId = '';
      const animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease'
      })
      animation.translateY(180).step()
      this.setData({
        animationReplyData: animation.export(),  
      })
      setTimeout(() => {
        this.setData({
          publisherNick: '',
          hideReplayModal: true
        })      
      },300)
    },

    // 获取回复列表
    async handlerCommentReplyList(e){
      let commentId = e.currentTarget.dataset.commentid,
        showChild = e.currentTarget.dataset.showchild;
      let res = null;
      if(!showChild){
        res = await mGetReplyList({
          commentId
        });
      }
      
      let commentList = this.data.commentList;
      commentList.map(item => {
        if(item.commentId === commentId){
          if(!item.showChild){
            item.children = res.data;
          } else {
            item.children = [];
          }
          item.showChild = !item.showChild;
        }
      })

      this.setData({
        commentList
      })
    },


    // 更新回复列表
    async refreshReplyList(commentId){
      let res = await mGetReplyList({
        commentId
      });
      
      let commentList = this.data.commentList;
      commentList.map(item => {
        if(item.commentId === commentId){
          item.children = res.data;
        }
      })

      this.setData({
        commentList
      })
    },

    // 发表回复
    async handlerReplyMessage(){
      if(!this.data.replyText){
        wx.showToast({
          icon: 'none',
          title: '请输入回复内容'
        })
        return;
      }
      
      await mAddChildComment({
        topicId: this.topicId,
        commentId: this.commentId,
        text: this.data.replyText
      })

      wx.showToast({
        icon: 'success',
        title: '回复成功'
      })

      this.setData({
        replyText: ''
      })

      this.refreshReplyList(this.commentId);
      this.handlerHideReplyDialog();
    },

    // 检测回复输入框的值
    handlerGetReplyText(e){
      this.setData({
        replyText: e.detail.value
      })
    },

    // 点击删除回复
    handlerDelReply(e){
      let _this = this;
      let replyId = e.currentTarget.dataset.replyid,
        commentId = e.currentTarget.dataset.commentid;
      wx.showModal({
        title: '提示',
        content: '确定要删除该条回复么？',
        confirmColor: '#EB9001',
        success(res){
          if(res.cancel) return;
          _this.delReply(replyId, commentId);
        }
      })
    },

    // 删除回复接口
    async delReply(replyId, commentId){
      await mDelCommentReply({
        replyId
      })

      wx.showToast({
        title: '删除成功'
      })
      
      this.refreshReplyList(commentId);
    }
  }
})
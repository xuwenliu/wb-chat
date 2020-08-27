import {
  request
} from './request';

// 所有接口
// 上传帖子
export const mSendTopic = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/topic/add'
  }), 'POST')
}

// 删除帖子
export const mDelTopic = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/topic/del'
  }), 'POST')
}

// 获取帖子分类
export const mGetTopicTypeList = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/topic/type/list'
  }), 'POST')
}

// 获取帖子列表
export const mGetTopicList = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/topic/list'
  }), 'POST')
}

// 对帖子进行评论
export const mAddComment = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/comment/add'
  }), 'POST')
}

// 删除帖子评论
export const mDelComment = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/comment/del'
  }), 'POST')
}

// 获取评论列表
export const mGetCommentList = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/comment/list'
  }), 'POST')
}

// 获取评论的回复列表
export const mGetReplyList = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/comment/reply/list'
  }), 'POST')
}

// 对评论进行回复
export const mAddChildComment = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/comment/reply/add'
  }), 'POST')
}

// 删回复
export const mDelCommentReply = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/comment/reply/del'
  }), 'POST')
}

// 对帖子进行点赞
export const mPraiseTopic = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/topic/praise'
  }), 'POST')
}

// 对点赞的帖子取消点赞
export const mCancelPraiseTopic = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/topic/praise/cancel'
  }), 'POST')
}

// 关注
export const mFollowUser = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/user/follow'
  }), 'POST')
}

// 取消关注
export const mCancelFollowUser = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/user/follow/cancel'
  }), 'POST')
}

// 获取我关注的用户
export const mGetFollowUser = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/user/follow/getFollowUser'
  }), 'POST')
}

// 获取关注我的用户
export const mGetFollowMeUser = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/user/follow/getFollowMeUser'
  }), 'POST')
}

// 获取用户信息
export const mGetOtherUserInfo = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/user/get'
  }), 'POST')
}

// 获取消息列表
export const mGetMessageList = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/msg/getUnreadMsgList'
  }), 'POST')
}

// 消息置为已读
export const mReadMessage = params => {
  return request(Object.assign(params, {
    apiUrl: '/web/mini/msg/read'
  }), 'POST')
}

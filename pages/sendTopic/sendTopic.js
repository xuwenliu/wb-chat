const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
let qqmapsdk;

import {
  mSendTopic,
  mGetTopicTypeList
} from '../../utils/actions';
import config from '../../utils/config';

let location = null;
let tempFiles = [];
let ossImgUrl = [];

const app = getApp();

Page({
  data: {
    content: '',
    img_url: [],
    classifyName: '',
    classifyList: [],
    locFlag: 1
  },
  async onLoad() {
    app.globalData.pageName = 'sendTopic';
    location = null;
    tempFiles = [];
    ossImgUrl = [];

    qqmapsdk = new QQMapWX({
      key: config.QQ_MAP_KEY
    });
    this.getTopicTypeList();
    location = await this.getUserLocation();
    location.address = await this.getAddress();
  },
  handlerLocFlag(e){
    console.log(e)
    this.setData({
      locFlag: e.detail.value ? 1 : 0
    })
  },

  // 获取经纬度
  getUserLocation(){
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'wgs84',
        success(res){
          resolve(res);
        }
      })
    })
  },

  // 点击图片进行大图查看
  LookPhoto(e) {
    let idx = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.img_url[idx],
      urls: this.data.img_url
    })
  },

  // 地址逆解析
  getAddress(){
    return new Promise((resolve, reject) => {
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        success: function (res) {
          let address = res.result.address;
          resolve(address);
        }
      })
    })
    
  },

  // 获取帖子分类列表
  async getTopicTypeList(){
    let res = await mGetTopicTypeList({});
    this.setData({
      classifyList: res.data
    })
  },

  // 输入动态
  handlerInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 选择图片 页面临时取本地的图片 发布的时候在上传图片
  chooseimage() {
    var _this = this;
    wx.chooseImage({
      count: 9 - _this.data.img_url.length, // 默认9 
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有 
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有 
      success: function (res) {
        if (res.tempFilePaths.length > 0) {
          //把每次选择的图push进数组
          let img_url = _this.data.img_url;
          for (let i = 0; i < res.tempFilePaths.length; i++) {
            img_url.push(res.tempFilePaths[i])
            tempFiles.push(res.tempFiles[i])
          }
          _this.setData({
            img_url: img_url
          })
        }
      }
    })
  },

  // 删除图片
  handlerReomveImg(e){
    let idx = e.currentTarget.dataset.index;
    let img_url = this.data.img_url;
    console.log(idx)
    tempFiles.splice(idx, 1);
    ossImgUrl.splice(idx, 1);
    img_url.splice(idx, 1);
    this.setData({
      img_url: img_url
    })

  },

  // 选择分类
  bindPickerChange(e){
    this.setData({
      classifyName: this.data.classifyList[e.detail.value]
    })
  },

  // 封装微信toast
  showToast(icon, title){
    wx.showToast({icon, title});
  },

  //发布按钮事件
  async handlerSendTopic() {
    if(!this.data.content) return this.showToast('none', '请输入动态');
    if(!this.data.classifyName) return this.showToast('none', '请输入分类');
    wx.showLoading({
      title: '发布中...',
    })
    let promiseList = [];
    let img_url = this.data.img_url;
    for (let i = 0; i < img_url.length; i++) {
      promiseList.push(this.uploadPromise(img_url[i], i))
    }
    await Promise.all(promiseList).catch(err => {
      this.showToast('fail', '发布成功');
    });
    let {
      latitude,
      longitude
    } = {
      ...location
    }
    
    let res = await mSendTopic({
      text: this.data.content,
      images: ossImgUrl.join(','),
      topicType: this.data.classifyName,
      lat: latitude.toFixed(4),
      lng: longitude.toFixed(4),
      address: location.address,
      locFlag: this.data.locFlag
    })
    this.showToast('success', '发布成功');
    setTimeout(() => {
      wx.navigateBack({})
    }, 500)
  },

  // 封装图片上传 并返回promise
  uploadPromise(filePath, idx){
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: config.BASE_URL + '/web/mini/topic/image/upload',
        filePath: filePath,
        name: 'file',
        formData: {
          token: config.TOKEN,
          file: tempFiles[idx]
        },
        header: {
          "Content-Type": "multipart/form-data"
        },
        success(res) {
          let json = JSON.parse(res.data);
          ossImgUrl.push(json.data);
          resolve(true);
        },
        fail(err) {
          reject(err)
        }
      })
    })
  }
})
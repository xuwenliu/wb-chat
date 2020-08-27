// pages/activity/activity.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: [
      {
        img:"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1591277048308&di=410e2592547474ac58025f923b3977ff&imgtype=0&src=http%3A%2F%2Fwww.canyingji.com%2Fuploadfiles%2F201907%2F20190715165559455945.jpg",
        title:"【功夫煲仔】新品腊味煲仔饭，全新上市！原价25元，现在只需要9.9尝鲜！",
        realPrice:9.9,
      },
      {
        img: "../../img/activity/new1.jpg",
        title: "【布莱玩具】专注品质毛绒玩具！全场只需10元！还不快送女朋友！！！抢完为止，概不还价",
        realPrice: 10,
      },
      {
        img: "../../img/activity/new2.jpg",
        title: "【阿仔奶茶】奶盖四兄弟限时抢购，原价15元一杯，现在只需要8元！第二杯半价！熊猫奶盖+芝士抹茶奶盖+四季春奶盖+榛果可可奶盖，四种口味，任意选择！",
        realPrice: 8,
      }
    ],
    autoplay: true,
    interval: 2000,
    duration: 500,
    activity:[
      {
        header:"大胃王挑战赛 | 你敢接战吗",
        items:[
          {
            img:"../../img/banner/chuan.png",
            content:"【傻七烧烤店】大胃王比赛，1分钟挑战30串大腰子",
            price:49.9
          },
          {
            img: "../../img/banner/jiu.png",
            content: "【老地方大排档啤酒挑战】看你酒量行不行，30分钟！优胜者另有现金大奖",
            price: 19.9
          },
          {
            img: "../../img/banner/shiji.png",
            content: "【好味道大排档】大胃王比赛，10分钟挑战30斤小龙虾，参赛人数50人",
            price: 50
          },
          {
            img: "../../img/banner/yeshi.png",
            content: "【傻七烧烤店】大胃王比赛，3分钟挑战10斤羊肉",
            price: 49.9
          }
        ]
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
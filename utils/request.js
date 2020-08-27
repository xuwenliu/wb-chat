
import config from './config';

// 封装请求接口
export const request = (params, method = 'GET') => {
  let reqUrl = `${config.BASE_URL}${params.apiUrl}`;
  delete params.apiUrl;
  params.token = config.TOKEN;

  return new Promise((resolve, reject) => {
    wx.request({
      url: reqUrl,
      header: 
        method === 'GET' 
        ? 
        { 'content-type': 'application/application/json' }
        : 
        { 'content-type': 'application/x-www-form-urlencoded' },
      method: method,
      data: params,
      timeout: 60 * 1000,
      success: json => {
        if (parseInt(json.statusCode) != 200) {
          reject(json);
          return;
        }

        if(json.data.code != 0){
          wx.showToast({
            icon: 'none',
            title: json.data.message
          })
          return;
        }

        resolve(json.data);
      },
      fail: err => {
        console.log('提示：错误接口 =>' + reqUrl)
        reject(err);
      },
      complete: res => {}
    })
  })
}




import { emojiMap, emojiUrl } from "./emojiMap";
// import { formatDuration, isJSON } from './index'
/** 传入message.element（群系统消息SystemMessage，群提示消息GroupTip除外）
 * content = {
 *  type: 'TIMTextElem',
 *  content: {
 *    text: 'AAA[龇牙]AAA[龇牙]AAA[龇牙AAA]'
 *  }
 *}
 **/

// 群提示消息的含义 (opType)
const GROUP_TIP_TYPE = {
  MEMBER_JOIN: 1,
  MEMBER_QUIT: 2,
  MEMBER_KICKED_OUT: 3,
  MEMBER_SET_ADMIN: 4, // 被设置为管理员
  MEMBER_CANCELED_ADMIN: 5, // 被取消管理员
  GROUP_INFO_MODIFIED: 6, // 修改群资料，转让群组为该类型，msgBody.msgGroupNewInfo.ownerAccount表示新群主的ID
  MEMBER_INFO_MODIFIED: 7, // 修改群成员信息
};

// 解析小程序text, 表情信息也是[嘻嘻]文本
function parseText(message) {
  let renderDom = [];
  let temp = message.payload.text;
  let left = -1;
  let right = -1;
  while (temp !== "") {
    left = temp.indexOf("[");
    right = temp.indexOf("]");
    switch (left) {
      case 0:
        if (right === -1) {
          renderDom.push({
            name: "text",
            text: temp,
          });
          temp = "";
        } else {
          let _emoji = temp.slice(0, right + 1);
          if (emojiMap[_emoji]) {
            renderDom.push({
              name: "image",
              src: emojiUrl + emojiMap[_emoji],
            });
            temp = temp.substring(right + 1);
          } else {
            renderDom.push({
              name: "text",
              text: "[",
            });
            temp = temp.slice(1);
          }
        }
        break;
      case -1:
        renderDom.push({
          name: "text",
          text: temp,
        });
        temp = "";
        break;
      default:
        renderDom.push({
          name: "text",
          text: temp.slice(0, left),
        });
        temp = temp.substring(left);
        break;
    }
  }
  return renderDom;
}

// // 解析自定义消息
// function parseCustom (message) {
//   let data = message.payload.data
//   if (isJSON(data)) {
//     data = JSON.parse(data)
//     if (data.hasOwnProperty('version') && data.version === 3) {
//       let tip
//       const time = formatDuration(data.duration)
//       switch (data.action) {
//         case -2:
//           tip = '异常挂断'
//           break
//         case 0:
//           tip = '请求通话'
//           break
//         case 1:
//           tip = '取消通话'
//           break
//         case 2:
//           tip = '拒绝通话'
//           break
//         case 3:
//           tip = '无应答'
//           break
//         case 4:
//           tip = '开始通话'
//           break
//         case 5:
//           if (data.duration === 0) {
//             tip = '结束通话'
//           } else {
//             tip = `结束通话，通话时长${time}`
//           }
//           break
//         case 6:
//           tip = '正在通话中'
//           break
//       }
//       return [{
//         name: 'videoCall',
//         text: tip
//       }]
//     }
//   }
//   return [{
//     name: 'custom',
//     text: data
//   }]
// }
// 解析message element
export function decodeElement(message) {
  // renderDom是最终渲染的
  switch (message.type) {
    case "TIMTextElem":
      return parseText(message);
    default:
      return [];
  }
}

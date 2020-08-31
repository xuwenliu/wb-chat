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

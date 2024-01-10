import { TextMessage } from '@line/bot-sdk';

export const welcomeMessage: TextMessage[] = [{
    type: 'text',
    text: '歡迎加入買票通知 BOT🎉'
},{
    type: 'text',
    text: '距離重要節日可以開始訂票前一天會發出訊息通知可購票。'
}];


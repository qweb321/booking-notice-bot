import * as line from '@line/bot-sdk';
import { ClientConfig, messagingApi, WebhookEvent } from '@line/bot-sdk';
import { welcomeMessage } from './messages/welcome';
import { textMessage } from './messages/testMessage';
import { getHoliday } from './config/holiday';
import { richMenuObjectA } from './messages/richMenuObject';
import { readFileSync } from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';

module.exports.webhook = async (event: any) => {
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

  const lineConfig: ClientConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,
  };
  const clientConfig: line.MiddlewareConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,
    channelSecret: process.env.CHANNEL_SECRET as string,
  };

  try {
    const client = new line.messagingApi.MessagingApiClient(lineConfig);
    // for webhook middleware
    line.middleware(clientConfig);

    const richMenuId = (await client.createRichMenu(richMenuObjectA)).richMenuId;
    const richMenuImage = readFileSync('./image/richmenu.jpg');

    await axios.post(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, richMenuImage, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Authorization': `Bearer ${lineConfig.channelAccessToken}`
      },
    });

    await axios.post(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, null, {
      headers: {
        'Authorization': `Bearer ${lineConfig.channelAccessToken}`
      }
    });

    const body: any = JSON.parse(event.body);
    const response: WebhookEvent = body.events[0];
    console.log('response', response);
    handleEvent(client, response);
  } catch (err) {
    console.error(err);
  }

};


const replyText = (client: messagingApi.MessagingApiClient, replyToken: string, msg: line.TextMessage | line.TextMessage[]) => {
  if (Array.isArray(msg)) {
    client.replyMessage({
      replyToken,
      messages: msg
    });
  } else {
    client.replyMessage({
      replyToken,
      messages: [msg]
    });
  }
};

const handleEvent = async (client: messagingApi.MessagingApiClient, event: WebhookEvent): Promise<void> => {
  try {
    switch (event.type) {
      case 'message':
        switch (event.message.type) {
          case 'text':
            return replyMessage(client, event);
          default:
            return;
        }
      case 'follow':
        return newFriendWelcome(client, event);
      case 'postback':
        return calenderSelect(client, event);
      default:
        break;
    }

  } catch (err) {
    console.error(err);
  }
};


const newFriendWelcome = async (client: messagingApi.MessagingApiClient, event: WebhookEvent): Promise<void> => {
  try {
    if (event.type !== 'follow') return;
    const { replyToken } = event;
    replyText(client, replyToken, welcomeMessage);
  } catch (err) {
    console.log(err);
  }
};

const replyMessage = async (client: messagingApi.MessagingApiClient, event: WebhookEvent): Promise<void> => {
  try {
    if (event.type !== 'message') return;
    const { replyToken, message } = event;
    if (message.type === 'text') {
      switch (message.text) {
        case '最近節慶':
          try {
            let msg: string = '最近的三個節日:';
            const year = new Date().getFullYear();
            const today = moment().tz('Asia/Taipei').format('YYYYMMDD');
            const data = await getHoliday(year, today);
            if ('slice' in data) {
              const recent3Days = data.slice(0, 3);
              recent3Days.forEach((item, index) => msg += `\n${index + 1}. ${item.date} ${item.description}`);
              replyText(client, replyToken, textMessage(msg));
            } else {
              // 處理 ApiError 的情況｀
              console.error('Error:', data.message);
            }
            break;
          } catch (err) {
            console.error('Error:', err);
            break;
          }
        case '最新資訊':
          replyText(client, replyToken, textMessage('啥都沒有'));
          break;
        default:
          replyText(client, replyToken, welcomeMessage);
      }
    } 
  } catch (err) {
    console.log(err);
  }
};

const calenderSelect = async (client: messagingApi.MessagingApiClient, event: WebhookEvent): Promise<void> => {
  try {
    if (event.type !== 'postback') return;
    const { replyToken, postback } = event;
    if (postback?.params && 'date' in postback.params) {
      const { date } = postback.params;
      const year = Number(date?.slice(0, 4));
      const selectDate = date?.replace(/-/g, '') || '';
      const data = await getHoliday(year, selectDate);
      if ('slice' in data) {
        let msg: string = `你所選日期${selectDate}最近的三個節日:`;
        const recent3Days = data.slice(0, 3);
        recent3Days.forEach((item, index) => msg += `\n${index + 1}. ${item.date} ${item.description}`);
        replyText(client, replyToken, textMessage(msg));
      } else {
        // 處理 ApiError 的情況｀
        console.error('Error:', data.message);
      }
    } else {
      // 處理 postback.params 不存在的情況
      console.error('Error: postback.params is undefined');
    }
  } catch (err) {
    console.error(err);
  }
};
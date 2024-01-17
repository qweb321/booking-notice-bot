import * as line from '@line/bot-sdk';
import { ClientConfig, messagingApi, WebhookEvent, WebhookRequestBody, PostbackEvent, FollowEvent, MessageEvent } from '@line/bot-sdk';
import { Request } from '@line/bot-sdk/dist/middleware';
import { welcomeMessage } from './messages/welcome';
import { textMessage } from './messages/testMessage';
import { getHoliday } from './config/holiday';
import { richMenuObjectA } from './messages/richMenuObject';
import { readFileSync } from 'fs';
import FetchApi from './message-api/api';
import moment from 'moment-timezone';

module.exports.webhook = async (event: Request): Promise<void> => {
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

  const fetchApi = FetchApi.instance;

  try {
    const client = new line.messagingApi.MessagingApiClient(lineConfig);
    // for webhook middleware
    line.middleware(clientConfig);

    const richMenuId = (await client.createRichMenu(richMenuObjectA)).richMenuId;
    const richMenuImage = readFileSync('./image/richmenu.jpg');

    await fetchApi.setMenuImage(richMenuId, richMenuImage, 'image/jpeg');

    await fetchApi.setDefaulMenu(richMenuId);

    console.log('event', event );
    const body: WebhookRequestBody = JSON.parse(event.body);
    console.log('body', body);
    const response: WebhookEvent = body.events[0];
    console.log('response', response);
    handleEvent(client, response);
  } catch (err) {
    console.error(err);
  }

};


const replyText = (client: messagingApi.MessagingApiClient, replyToken: string, msg: line.TextMessage | line.TextMessage[]): void => {
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


const newFriendWelcome = async (client: messagingApi.MessagingApiClient, event: FollowEvent): Promise<void> => {
  try {
    // if (event.type !== 'follow') return;
    const { replyToken } = event;
    replyText(client, replyToken, welcomeMessage);
  } catch (err) {
    console.log(err);
  }
};

const replyMessage = async (client: messagingApi.MessagingApiClient, event: MessageEvent): Promise<void> => {
  try {
    // if (event.type !== 'message') return;
    const { replyToken, message } = event;
    if (message.type === 'text') {
      switch (message.text) {
        case '最近節慶':
          try {
            let msg: string = '最近的三個節日:';
            const year = new Date().getFullYear();
            const today = moment().tz('Asia/Taipei').format('YYYYMMDD');
            const data = await getHoliday(year, today);
            console.log(data);
            if (Array.isArray(data)) {
              // const recent3Days = data.slice(0, 3);
              data.forEach((item, index) => msg += `\n${index + 1}. ${item.date} ${item.description}`);
              replyText(client, replyToken, textMessage(msg));
            } else {
              console.error(data.message);
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

const calenderSelect = async (client: messagingApi.MessagingApiClient, event: PostbackEvent): Promise<void> => {
  try {
    // if (event.type !== 'postback') return;
    const { replyToken, postback } = event;
    if (postback?.params && 'date' in postback.params) {
      const { date } = postback.params;
      const year = Number(date?.slice(0, 4));
      const selectDate = date?.replace(/-/g, '') || '';
      const data = await getHoliday(year, selectDate);
      if (Array.isArray(data)) {
        let msg: string = `你所選日期${selectDate}最近的三個節日:`;
        data.forEach((item, index) => msg += `\n${index + 1}. ${item.date} ${item.description}`);
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
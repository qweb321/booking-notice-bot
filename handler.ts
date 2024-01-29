import * as line from '@line/bot-sdk';
import { ClientConfig, messagingApi, WebhookEvent, WebhookRequestBody, PostbackEvent, FollowEvent, MessageEvent, FlexComponent } from '@line/bot-sdk';
import { Request } from '@line/bot-sdk/dist/middleware';
import { welcomeMessage } from './messages/welcome';
import { textMessage } from './messages/testMessage';
import { bookingFlexMessage, flexMessage, boxtMessage } from './messages/flex-message';
import { getHoliday, getContinuousHolidays } from './config/holiday';
import { richMenuObjectA } from './messages/richMenuObject';
import { readFileSync } from 'fs';
import FetchApi from './message-api/api';
import { getThsrcNews } from './config/get-days-in-month';
import path from 'path';

module.exports.webhook = async (event: Request): Promise<void | { statusCode: number; }> => {
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
    const imagePath = path.join(__dirname, 'image', 'richmenu.jpg');
    const richMenuImage = readFileSync(imagePath);

    await fetchApi.setMenuImage(richMenuId, richMenuImage, 'image/jpeg');

    await fetchApi.setDefaulMenu(richMenuId);

    const body: WebhookRequestBody = JSON.parse(event.body);
    const response: WebhookEvent = body.events[0];
    if (!body.events.length) {
      return {
        statusCode: 200,
      };
    }
    await handleEvent(client, response);
  } catch (err) {
    console.error(err);
  }

};


const replyText = async (client: messagingApi.MessagingApiClient, replyToken: string, msg: line.TextMessage | line.TextMessage[] | line.FlexMessage): Promise<void> => {
  if (Array.isArray(msg)) {
    await client.replyMessage({
      replyToken,
      messages: msg
    });
  } else {
    await client.replyMessage({
      replyToken,
      messages: [msg]
    });
  }
};

const handleEvent = async (client: messagingApi.MessagingApiClient, event: WebhookEvent): Promise<void> => {
  try {
    if (event) {
      switch (event.type) {
        case 'message':
          switch (event.message.type) {
            case 'text':
              return await replyMessage(client, event);
            default:
              return;
          }
        case 'follow':
          await newFriendWelcome(client, event);
          break;
        case 'postback':
          return await calenderSelect(client, event);
        default:
          console.error(`Unhandled event type: ${event.type}`);
          break;
      }
    }
  } catch (err) {
    console.error(err);
  }
};


const newFriendWelcome = async (client: messagingApi.MessagingApiClient, event: FollowEvent): Promise<void> => {
  try {
    const { replyToken } = event;
    await replyText(client, replyToken, welcomeMessage);
  } catch (err) {
    console.error(err);
  }
};

const replyMessage = async (client: messagingApi.MessagingApiClient, event: MessageEvent): Promise<void> => {
  try {
    const { replyToken, message } = event;
    if (message.type === 'text') {
      switch (message.text) {
        case '今年假期':
          try {
            const contents: FlexComponent[] = [];
            const year = new Date().getFullYear();
            const data = await getContinuousHolidays(year);
            if (Array.isArray(data)) {
              data.forEach((item, index) =>
                contents.push(boxtMessage('vertical', [{
                  type: 'text',
                  text: `${index + 1}. ${item.startDay} 到 ${item.endDay} 連續${item.continuous}日 ${item.description}`,
                  wrap: true
                }]))
              );
              await replyText(client, replyToken, flexMessage(contents));
            } else {
              console.error(data.message);
            }
            break;
          } catch (err) {
            console.error('Error:', err);
            break;
          }
        case '最新資訊':
          try {
            const thsrcNews = await getThsrcNews();
            const contents: FlexComponent[] = [{ type: 'text', text: '台鐵、高鐵票可訂購時間⬇️', weight: 'bold' }];
            if (thsrcNews) {
              thsrcNews.forEach((item) =>
                contents.push(boxtMessage('vertical', [{
                  type: 'text',
                  text: `${item[0]}: ${item[2]}`,
                  wrap: true,
                }]))
              );
              await replyText(client, replyToken, bookingFlexMessage(contents));
            } else {
              await replyText(client, replyToken, textMessage('啥都沒有'));
            }
          } catch (err) {
            console.error(err);
          }
          break;
        default:
          await replyText(client, replyToken, welcomeMessage);
      }
    }
  } catch (err) {
    console.error(err);
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
      const contents: FlexComponent[] = [{ type: 'text', text: `${selectDate}最近的三個假期⬇️`, weight: 'bold' }];
      if (Array.isArray(data)) {
        if (!data.length) {
          contents.push(boxtMessage('vertical', [{
            type: 'text',
            text: '目前沒有假期'
          }]));
          return await replyText(client, replyToken, flexMessage(contents));
        } else {
          data.forEach((item) =>
            contents.push(boxtMessage('vertical', [{
              type: 'text',
              text: `${item.startDay}至${item.endDay}，${item.continuous}日，${item.description}`,
              wrap: true,
            }]))
          );
          return await replyText(client, replyToken, flexMessage(contents));
        }
      } else {
        contents.push(boxtMessage('vertical', [{
          type: 'text',
          text: '目前沒有假期'
        }]));
        return await replyText(client, replyToken, flexMessage(contents));
      }
    } else {
      // 處理 postback.params 不存在的情況
      console.error('Error: postback.params is undefined');
    }
  } catch (err) {
    console.error(err);
  }
};
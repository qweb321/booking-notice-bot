import { ClientConfig, messagingApi, WebhookEvent } from '@line/bot-sdk';
import { welcomeMessage } from './messages/welcome';
import { textMessage } from './messages/testMessage';


module.exports.webhook = async (event: any) => {
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

  const clientConfig: ClientConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,
    channelSecret: process.env.CHANNEL_SECRET,
  };

  const client = new messagingApi.MessagingApiClient(clientConfig);
  
  try {
    console.log('body', event.body);
    const body: any = JSON.parse(event.body);
    const response: WebhookEvent = body.events[0];
    await newFriendWelcome(client, response);
    await replyMessage(client, response);

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Connect Success',
        },
        null,
        2
      ),
    };
  } catch (err) {
    console.log(err);
  }

};


const newFriendWelcome = async (client: messagingApi.MessagingApiClient, event: WebhookEvent): Promise<void> => {
  try {
    console.log('client', client);
    console.log(event);
    console.log(typeof event);
    if (event.type !== 'follow') return;
    const { replyToken } = event;
    await client.replyMessage({
      replyToken, messages: welcomeMessage
    });
  } catch (err) {
    console.log(err);
  }
};

const replyMessage = async (client: messagingApi.MessagingApiClient, event: WebhookEvent): Promise<void> => {
  try{
    if (event.type !== 'message') return;
    const { replyToken, message } = event;
    switch (message.type) {
      case 'text':
        if (message.text === '最近節慶') {
          await client.replyMessage({ replyToken, messages: [textMessage('我收到了最近節慶')]});
        } else {
          await client.replyMessage({ replyToken, messages: [textMessage('啥都沒有')] });
        }
        break;
      default:
        await client.replyMessage({ replyToken, messages: [textMessage('morning')] });
    }
  } catch (err) {

  }
};
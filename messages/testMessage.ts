import { TextMessage } from '@line/bot-sdk';

export const textMessage = (text: string): TextMessage => {
    return {
        type: 'text',
        text,
    };
};
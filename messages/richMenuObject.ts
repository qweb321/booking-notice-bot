import { RichMenu } from '@line/bot-sdk';
import moment from 'moment';

export const richMenuObjectA: RichMenu  ={
    size: {
        width: 2500,
            height: 843
    },
    selected: true,
        name: 'richmenu-b',
            chatBarText: 'Tap to open',
                areas: [
                    {
                        bounds: {
                            x: 14,
                            y: 29,
                            width: 787,
                            height: 770
                        },
                        action: {
                            type: 'message',
                            text: '今年假期'
                        }
                    },
                    {
                        bounds: {
                            x: 863,
                            y: 33,
                            width: 772,
                            height: 771
                        },
                        action: {
                            type: 'message',
                            text: '最新資訊'
                        }
                    },
                    {
                        bounds: {
                            x: 1692,
                            y: 29,
                            width: 788,
                            height: 783
                        },
                        action: {
                            type: 'datetimepicker',
                            data: '資料 4',
                            mode: 'date',
                            initial: moment(Date.now()).format('YYYY-MM-DD'),
                            max: '2025-01-15',
                            min: '2023-01-15'
                        }
                    }
                ]
};
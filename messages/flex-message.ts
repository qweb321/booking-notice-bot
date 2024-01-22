import { FlexMessage, FlexComponent, FlexBox } from '@line/bot-sdk';

export const boxtMessage = (layout: 'horizontal' | 'vertical' | 'baseline', contents: FlexComponent[] ): FlexBox => {
    return {
        type: 'box',
        layout: layout,
        contents: contents
    };
};

export const flexMessage = (flexContents: FlexComponent[]): FlexMessage => {
    return {
        type: 'flex',
        altText: '節慶清單',
        contents: {
            type: 'bubble',
            header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: '今年假期',
                        size: 'xl',
                        align: 'center',
                        weight: 'bold',
                    }
                ],
            },
            hero: {
                type: 'image',
                url: 'https://cdn-icons-png.flaticon.com/256/10691/10691802.png',
                size: 'md',
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: flexContents,
                alignItems: 'flex-start',
                justifyContent: 'space-around',
                spacing: '10px'
            }
        }
    };
};

export const bookingFlexMessage = (flexContents: FlexComponent[]): FlexMessage => {
    return {
        type: 'flex',
        altText: '訂票通知',
        contents: {
            type: 'bubble',
            hero: {
                type: 'image',
                url: 'https://cdn-icons-png.flaticon.com/256/10691/10691802.png',
                size: 'md',
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    ...flexContents,
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            {
                                type: 'button',
                                style: 'link',
                                action: {
                                    type: 'uri',
                                    label: '台鐵訂票網',
                                    uri: 'https://tip.railway.gov.tw/tra-tip-web/tip/tip001/tip123/query'
                                },
                                flex: 0
                            },
                            {
                                type: 'button',
                                style: 'link',
                                action: {
                                    type: 'uri',
                                    label: '高鐵訂票網',
                                    uri: 'https://www.thsrc.com.tw/'
                                },
                                flex: 0
                            },
                        ],
                        alignItems: 'center',
                        justifyContent: 'space-around',
                    },
                ],
                alignItems: 'flex-start',
                justifyContent: 'space-around',
                spacing: '10px'
            }
        }
    };
};

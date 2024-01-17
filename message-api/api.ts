import axios from 'axios';


export default class FetchApi {
    static instance: FetchApi = new FetchApi();

    constructor () {}

    async setMenuImage(richMenuId: string, richMenuImage: Buffer, contentType: string) {
        await axios.post(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, richMenuImage, {
            headers: {
                'Content-Type': contentType,
                'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
              },
        });
    }

    async setDefaulMenu(richMenuId: string) {
        await axios.post(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, null, {
            headers: {
                'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
            }
        });
    }
}
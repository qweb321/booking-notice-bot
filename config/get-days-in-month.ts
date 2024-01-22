import moment from 'moment';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const getDaysInMonth = (date: string) => {
    const before29Days = moment(date).subtract(29, 'days');
    return moment(before29Days).format('YYYY-MM-DD');
};



export const getThsrcNews = async (): Promise<string[][] | undefined> => {
    try {
        const url = 'https://www.thsrc.com.tw/ArticleContent/60dbfb79-ac20-4280-8ffb-b09e7c94f043';
        // 發送 GET 請求取得網頁內容
        const response = await axios.get(url);

        // 使用 Cheerio 解析 HTML
        const $ = cheerio.load(response.data);
        // 根據 HTML 結構找到表格元素
        const table = $('table');

        // 使用 Cheerio 提供的方法來處理表格內容
        const tableData: string[][] = [];
        table.find('tr').filter((i, row) => $(row).find('td').length > 0).each((i, row) => {
            const rowData: string[] = [];
            $(row).find('td').each((j, cell) => {
                rowData.push($(cell).text().trim());
            });
            tableData.push(rowData);
        });
        // 輸出表格資訊
        return tableData;
    } catch (error) {
        console.error('抓取資料失敗:', error);
    }
};

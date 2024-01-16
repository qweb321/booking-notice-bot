import axios from 'axios';
import moment from 'moment-timezone';

type Schedule = {
    date: string,
    week: string,
    isHoliday: boolean,
    description: string,
} 


type ApiError = {
    message: string
    status: number
}

export const getHoliday = async (year: number, date: string): Promise<Schedule[] | ApiError> => {
    try { 
        const url: string = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`;
        const { data } = await axios.get<Schedule[]>(url);
        const resent3Days = data.filter((item) => moment(item.date) > moment(date) && item.isHoliday === true && item.description);

        return resent3Days;
    } catch(error: any) {
        return {
            message: error.message,
            status: error.status
        };
    }
};
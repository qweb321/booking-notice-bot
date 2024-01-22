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

type MergeDay = {
    startDay: string,
    endDay: string,
    continuous: number,
    description: string[]

}

export const getHoliday = async (year: number, date: string): Promise<MergeDay[] | undefined> => {
    try {
        // const url: string = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`;
        // const { data } = await axios.get<Schedule[]>(url);
        const allHolidays = await getContinuousHolidays(year);
    if (Array.isArray(allHolidays)) {
        const resent3Days = allHolidays.filter((item) => moment(item.startDay) > moment(date) && moment(item.endDay) > moment(date)).slice(0, 3);
        return resent3Days;
    }
    } catch (error: any) {
        return error;
    }
};

export const getContinuousHolidays = async (year: number): Promise<MergeDay[] | ApiError> => {
    try {
        const url: string = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`;
        const { data } = await axios.get<Schedule[]>(url);
        const allHolidays = data.filter((item) => item.isHoliday === true);
        const continuousHolidays = [];
        let current = null;

        for (const holiday of allHolidays) {
            if (current === null) {
                current = {
                    startDay: holiday.date,
                    endDay: holiday.date,
                    continuous: 1,
                    description: holiday.description !== '' ? [holiday.description] : []
                };
            } else if (current && moment(current.endDay).diff(moment(holiday.date), 'days') === -1) {
                current.continuous = current.continuous + 1;
                if (holiday.description !== '') {
                    current.description.push(holiday.description);
                }
                current.endDay = holiday.date;
            } else if (current && moment(current.endDay).diff(moment(holiday.date), 'days') !== -1) {
                if (current.description.join('') !== '') {
                    continuousHolidays.push(current);
                }
                current = {
                    startDay: holiday.date,
                    endDay: holiday.date,
                    continuous: 1,
                    description: holiday.description !== '' ? [holiday.description] : []
                };
            }
        }

        // 返回格式化後的連續假期
        return continuousHolidays;
    } catch (error: any) {
        console.error(error);
        return {
            message: error.message,
            status: error.status
        };
    }
};
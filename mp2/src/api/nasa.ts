import axios from "axios";
import { Apod } from "../types";

const API_KEY = process.env.REACT_APP_NASA_KEY;

export const nasa = axios.create({
  baseURL: "https://api.nasa.gov/planetary",
  params: { api_key: API_KEY },
});

async function getWithRetry<T>(url: string, params: Record<string, any>, retries = 2): Promise<T> {
    try {
        const { data } = await nasa.get<T>(url, { params });
        return data;
    } catch (err: any) {
        const status = err?.response?.status;
        if ((status === 429 || status >= 500) && retries > 0) {
            const waitMs = (3- retries) * 1000 + 1000; // 1s, then 2s
            await new Promise((r) => setTimeout(r, waitMs));
            return getWithRetry(url, params, retries - 1);
        }
        throw err;
    }
}

export async function fetchApods(startDate: string, endDate: string): Promise<Apod[]> {
    const data = await getWithRetry<Apod[]>("/apod", { start_date: startDate, end_date: endDate, thumbs: true });
    // Sort newest to oldest for consistent UI
    return [...data].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function fetchApodByDate(date: string): Promise<Apod> {
    return getWithRetry<Apod>("/apod", { date, thumbs: true });
}

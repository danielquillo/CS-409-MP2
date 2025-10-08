export type Apod = {
    date: string;
    title: string;
    explanation: string;
    media_type: 'image' | 'video';
    url: string;
    hdurl?: string;
    thumbnail_url?: string;
    copyright?: string;
}

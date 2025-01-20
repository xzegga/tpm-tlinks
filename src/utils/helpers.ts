import { Timestamp } from "firebase/firestore";

export const transfromTimestamp = (time: Timestamp) => {
    const fireBaseTime = new Date(
        time.seconds * 1000 + time.nanoseconds / 1000000,
    );
    const date = new Date(fireBaseTime.toDateString());
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get absolute path without file name 
export const getAbsolutePath = (path: string) => {
    const index = path.lastIndexOf('/');
    return path.substring(0, index);
}

// Shorten file name with ... between the midle of the name
export const shortenFileName = (fileName: string, size: number = 40) => {
    const fileNameLength = fileName.length;
    if (fileNameLength > size) {
        const midle = Math.floor(size / 2);
        const start = fileName.substring(0, midle);
        const end = fileName.substring(fileNameLength - midle, fileNameLength);
        return start + '...' + end;
    }
    return fileName;
}


// Shorten file name with ... between the midle of the name
export const shortenName = (value: string, size: number = 40) => {
    const fileNameLength = value;
    if (fileNameLength.length > size) {
        const start = value.substring(0, size);
        return start + '...';
    }
    return value;
}


// Generate array of years from 2022
export const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const endYear = currentYear;
    const years = [];

    for (let i = 2022; i <= endYear; i++) {
        years.push(i);
    }
    return years;
}

export const twoDigitDate = (date: number) => {
    return date < 10 ? `0${date}` : date;
}

// Concatenate milisecond to a file name before its file extension
export const createFileName = (fileName: string) => {
    const milisecond = Timestamp.fromDate(new Date()).toMillis();
    const index = fileName.lastIndexOf('.');
    const name = fileName.substring(0, index);
    const extension = fileName.substring(index, fileName.length);
    return `${name}_${milisecond}${extension}`;
}
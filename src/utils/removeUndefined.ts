export function removeUndefinedProps<T extends object>(obj: T): T {
    Object.keys(obj).forEach(key => {
        if (obj[key as keyof T] === undefined) {
            delete obj[key as keyof T];
        }
    });

    return obj;
}
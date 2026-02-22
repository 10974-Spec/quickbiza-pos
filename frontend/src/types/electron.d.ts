export { };

declare global {
    interface Window {
        electron: {
            openExternal: (url: string) => void;
            [key: string]: any;
        };
    }
}

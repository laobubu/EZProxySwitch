declare namespace browser {
    const browserAction = chrome.browserAction;
    const runtime = chrome.runtime;
    const extension = chrome.extension;
    const tabs = chrome.tabs;

    namespace proxy {
        function register(pacUri: string): Promise<void>;
        function unregister(): Promise<void>;

        const onProxyError: chrome.events.Event<Error>;
    }

    namespace storage {
        interface StorageArea {
            get(): Promise<object>;
            set(data: object): Promise<void>;
        }

        const local: StorageArea;
        const sync: StorageArea;
        const managed: StorageArea;
    }
}

declare namespace chrome {
    namespace runtime {
        function sendMessage(message: any, options?: object): Promise<any>;
    }
}
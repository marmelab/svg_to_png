import { convertToPngFactory } from './convertToPng';

describe('convertToPng', () => {
    const client = {
        close: jest.fn(),
        Emulation: {
            setDeviceMetricsOverride: jest.fn(),
            setVisibleSize: jest.fn(),
        },
        Page: {
            captureScreenshot: jest.fn(() => Promise.resolve({ data: 'data' })),
            enable: jest.fn(),
            loadEventFired: jest.fn(() => Promise.resolve()),
            navigate: jest.fn(),
        },
    };

    const chromeRemoteInterface = () => Promise.resolve(client);

    const chrome = { kill: jest.fn() };
    const launch = jest.fn(() => Promise.resolve(chrome));
    const convertHtmlToDataUrl = jest.fn(() => 'html_data_url');
    const convertToPng = convertToPngFactory({
        chromeRemoteInterface,
        launch,
        convertHtmlToDataUrl,
    });

    it('starts chrome with correct options', async () => {
        await convertToPng('svg', {});
        expect(launch).toHaveBeenCalledWith({
            port: 9222,
            chromeFlags: [
                '--headless',
                '--disable-gpu',
                '--no-sandbox',
                '--no-scrollbars',
            ],
        });
    });

    it('open the base64 encoded html file in chrome', async () => {
        await convertToPng('svg', {});
        expect(client.Page.navigate).toHaveBeenCalledWith({
            url: 'html_data_url',
        });
    });

    it('resize chrome as specified in options', async () => {
        await convertToPng('svg', { width: 100, height: 50 });
        expect(client.Emulation.setVisibleSize).toHaveBeenCalledWith({
            width: 100,
            height: 50,
        });
    });

    it('returns the screenshot as binary data', async () => {
        const data = await convertToPng('svg', {});
        expect(data).toEqual('data');
    });
});

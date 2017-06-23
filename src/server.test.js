import { handlePostFactory } from './server';

describe('handlePost', () => {
    const convertToPng = jest.fn(() => Promise.resolve('svg'));
    const handlePost = handlePostFactory(convertToPng);
    const res = {
        setHeader: jest.fn(),
        end: jest.fn(),
    };

    it('converts svg from request body with options and returns a buffer', async () => {
        const req = { query: { height: 100, width: 200 } };
        await handlePost(req, res);
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Length', 2);
        expect(res.end.mock.calls[0][0]).toBeInstanceOf(Buffer);
    });

    it('converts svg from request body with options and returns a data-url', async () => {
        const req = { query: { height: 100, width: 200, 'data-url': true } };
        await handlePost(req, res);
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Length', 2);
        expect(res.end).toHaveBeenCalledWith('data:image/png;base64,svg');
    });
});

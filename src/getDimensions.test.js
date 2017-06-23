import getDimensions from './getDimensions';

describe('getDimensions', () => {
    it('parse the dimensions from the svg', () => {
        expect(
            getDimensions(
                '<svg xmlns="http://www.w3.org/2000/svg" width="875.0386" height="307.5186" viewBox="0 0 875.0386 307.5186"></svg>',
                {},
            ),
        ).toEqual({
            width: 876,
            height: 308,
        });
    });

    it('parse the dimensions from the svg and resize from options.width, preserving propertions', () => {
        expect(
            getDimensions(
                '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 875.0386 307.5186"></svg>',
                { width: 200 },
            ),
        ).toEqual({
            width: 200,
            height: 75,
        });
    });

    it('parse the dimensions from the svg and resize from options.height, preserving propertions', () => {
        expect(
            getDimensions(
                '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 875.0386 307.5186"></svg>',
                { height: 75 },
            ),
        ).toEqual({
            width: 200,
            height: 75,
        });
    });

    it('discards the dimensions from the svg and returns the dimensions specified in options', () => {
        expect(
            getDimensions(
                '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 875.0386 307.5186"></svg>',
                { width: 200, height: 100 },
            ),
        ).toEqual({
            width: 200,
            height: 100,
        });
    });
});

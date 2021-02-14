import {
    formatSource,
    outputResultsAsDataUrlsFactory,
} from './outputResultsAsDataUrls';

describe('outputResultsAsDataUrls', () => {
    const writeToClipboard = jest.fn();
    const print = jest.fn();
    const outputResultsAsDataUrls = outputResultsAsDataUrlsFactory({
        writeToClipboard,
        print,
    });

    it('prints the results to console', () => {
        outputResultsAsDataUrls([
            { data: 'a_png', source: 'an_svg' },
            { data: 'another_png', source: 'another_svg' },
        ]);

        expect(print).toHaveBeenCalledWith(formatSource('an_svg'));
        expect(print).toHaveBeenCalledWith('a_png');

        expect(print).toHaveBeenCalledWith(formatSource('another_svg'));
        expect(print).toHaveBeenCalledWith('another_png');
    });

    it('copies a single result to clipboard', () => {
        outputResultsAsDataUrls([{ data: 'a_png', source: 'an_svg' }]);

        expect(writeToClipboard).toHaveBeenCalledWith('a_png');
        expect(print).toHaveBeenCalledWith('a_png');
    });
});

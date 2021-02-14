import EventEmitter from 'events';
import getSvgFromStdIn from './getSvgFromStdIn';

describe('getSvgFromStdIn', () => {
    const stdin = new EventEmitter();
    stdin.read = jest.fn(() => 'data');

    it('throws an error if no input after specified timeout', async () => {
        await getSvgFromStdIn(stdin, 200)
            .then(() => {
                throw Error('Should not resolve');
            })
            .catch(error =>
                expect(error.message).toEqual('No entry detected aborting'),
            );
    });

    it('returns the data from stdin', async () => {
        const promise = getSvgFromStdIn(stdin);
        stdin.emit('readable');
        stdin.emit('end');
        const data = await promise;
        expect(data).toEqual('data');
    });
});

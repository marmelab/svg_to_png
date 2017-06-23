import { executeShellCommandFactory } from './executeShellCommand';

describe('executeShellCommand', () => {
    const startServer = jest.fn(() => Promise.resolve());
    const readFileSync = jest.fn(path => path);
    const getSvgFromStdIn = jest.fn(() => Promise.resolve('an_svg'));
    const convertToPng = jest.fn(() => Promise.resolve('data'));
    const handleResults = jest.fn(() => Promise.resolve());
    const question = jest.fn(() => false);
    const showHelp = jest.fn(() => Promise.resolve());

    const executeShellCommand = executeShellCommandFactory(
        startServer,
        readFileSync,
        getSvgFromStdIn,
        convertToPng,
        handleResults,
        question,
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('starts the http server if options.http is set', async () => {
        await executeShellCommand({ http: true });

        expect(startServer).toHaveBeenCalled();
    });

    it('asks to start the http server if no inputs was given', async () => {
        const executeShellCommandTimedOut = executeShellCommandFactory(
            startServer,
            readFileSync,
            jest.fn(() => Promise.reject({ message: 'foo' })),
            convertToPng,
            handleResults,
            question,
        );

        await executeShellCommandTimedOut({}, showHelp);

        expect(question).toHaveBeenCalledWith(
            'Did you mean to run in server mode ? (y/n default n)',
        );
    });

    it('starts the http server if no inputs was given and user answered yes', async () => {
        const executeShellCommandTimedOut = executeShellCommandFactory(
            startServer,
            readFileSync,
            jest.fn(() => Promise.reject({ message: 'foo' })),
            convertToPng,
            handleResults,
            () => true,
        );

        await executeShellCommandTimedOut({}, showHelp);

        expect(startServer).toHaveBeenCalled();
    });

    it('shows the help if no inputs was given', async () => {
        const executeShellCommandTimedOut = executeShellCommandFactory(
            startServer,
            readFileSync,
            jest.fn(() => Promise.reject({ message: 'foo' })),
            convertToPng,
            handleResults,
            question,
        );

        await executeShellCommandTimedOut({}, showHelp);

        expect(showHelp).toHaveBeenCalled();
    });

    it('converts png sent through stdin', async () => {
        await executeShellCommand({}, showHelp);

        expect(convertToPng).toHaveBeenCalledWith('an_svg', {});
    });

    it('converts pngs sent through options', async () => {
        const options = {
            files: ['an_svg', 'another_svg'],
        };
        await executeShellCommand(options, showHelp);

        expect(convertToPng).toHaveBeenCalledWith('an_svg', options);
        expect(convertToPng).toHaveBeenCalledWith('another_svg', options);
    });
});

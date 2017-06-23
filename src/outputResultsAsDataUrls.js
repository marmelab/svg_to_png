import { platform } from 'os';
import chalk from 'chalk';
import writeToClipboard from './writeToClipboard';

const print = console.log; // eslint-disable-line
export const formatSource = chalk.bold.green;
const formatMessage = chalk.bold.gray;

export const outputResultsAsDataUrlsFactory = (
    writeToClipboardImpl,
    printImpl,
) => results => {
    results.map(async result => {
        if (results.length === 1) {
            printImpl('\n');
            printImpl(result.data);

            try {
                writeToClipboardImpl(result.data);
                printImpl('\n');
                printImpl(
                    formatMessage(
                        `The data url for ${result.source} has been copied in your clipboard`,
                    ),
                );
            } catch (error) {
                console.error(error);
                if (platform() === 'linux') {
                    printImpl(
                        formatMessage(
                            'Install xclip if you want the url to be copied in your clipboard automatically.',
                        ),
                    );
                }
            }

            return;
        }

        printImpl('\n');
        printImpl(formatSource(result.source));
        printImpl('\n');
        printImpl(result.data);
    });
};

export default outputResultsAsDataUrlsFactory(writeToClipboard, print);

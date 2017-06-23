import { platform } from 'os';
import chalk from 'chalk';
import defaultWriteToClipboard from './writeToClipboard';

const defaultPrint = console.log; // eslint-disable-line
export const formatSource = chalk.bold.green;
const formatMessage = chalk.bold.gray;

export const outputResultsAsDataUrlsFactory = ({
    writeToClipboard = defaultWriteToClipboard,
    print = defaultPrint,
}) => results => {
    results.map(async result => {
        if (results.length === 1) {
            print('\n');
            print(result.data);

            try {
                writeToClipboard(result.data);
                print('\n');
                print(
                    formatMessage(
                        `The data url for ${result.source} has been copied in your clipboard`,
                    ),
                );
            } catch (error) {
                console.error(error);
                if (platform() === 'linux') {
                    print(
                        formatMessage(
                            'Install xclip if you want the url to be copied in your clipboard automatically.',
                        ),
                    );
                }
            }

            return;
        }

        print('\n');
        print(formatSource(result.source));
        print('\n');
        print(result.data);
    });
};

export default outputResultsAsDataUrlsFactory({});

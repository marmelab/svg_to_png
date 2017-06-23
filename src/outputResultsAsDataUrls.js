import { platform } from 'os';
import chalk from 'chalk';
import writeToClipboard from './writeToClipboard';

const print = console.log; // eslint-disable-line
const formatSource = chalk.bold.green;
const formatMessage = chalk.bold.gray;

export default (results, { noCopy }) => {
    Promise.all(
        results.map(async result => {
            if (results.length === 1) {
                print('\n');
                print(result.data);
                try {
                    if (!noCopy) {
                        await writeToClipboard(result.data);
                        print('\n');
                        print(
                            formatMessage(
                                `The data url for ${result.source} has been copied in your clipboard`,
                            ),
                        );
                    }
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
        }),
    );
};

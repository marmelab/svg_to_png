import commander from 'commander';
import executeShellCommand from './executeShellCommand';

const print = console.log; // eslint-disable-line

commander
    .version('0.0.1')
    .description('An svg to png converter using chrome in headless mode.')
    .usage(
        `
    # passing file paths as arguments
    svg_to_png [options] <file ...>

    # piping a file
    svg_to_png [options] < file

    # starting an http server listening to POST requests with the svg as their body
    svg_to_png --http
    `,
    )
    .option(
        '--out [value]',
        'Where to output the file: either a file path for single source or a directory path for multiple sources.',
    )
    .option(
        '-f, --force',
        'Whether to override existing files. Default is false.',
    )
    .option(
        '-w, --width <n>',
        'The width of the generated PNG (if height is not specified, tries to preserve proportions). By default, it will use the svg width.',
        parseInt,
    )
    .option(
        '-h, --height <n>',
        'The height of the generated PNG (if width is not specified, tries to preserve proportions). By default, it will use the svg height.',
        parseInt,
    )
    .option('--http', 'Starts the HTTP server')
    .option(
        '-p, --port <n>',
        'The port of the http server. Default is 3000',
        parseInt,
        3000,
    );

const options = commander.parse(process.argv);
executeShellCommand(
    {
        out: options.out,
        files: options.args,
        force: options.force,
        height: isNaN(options.height) ? undefined : options.height,
        http: options.http,
        port: isNaN(options.port) ? undefined : options.port,
        width: isNaN(options.width) ? undefined : options.width,
    },
    () => commander.help,
)
    .then(() => process.exit())
    .catch(error => console.error(error));

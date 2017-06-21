svg_to_png
===========

An svg to png converter using chrome in headless mode.

## Usage

You can pipe an svg to the command:

```sh
svg_to_png < myImage.svg
```

You can specify file(s) as arguments:

```sh
svg_to_png myImage.svg myImage2.svg
```

It's also possible to start an http-server:

```sh
svg_to_png --http
```

The server will listen to `POST` requests containing the svg as their body and will return the data-url for the converted PNG in the response body.

## Running in a container

```sh
cat kiwi.svg | docker run --name svg_to_png -i svg_to_png
```

Note the `-i` which is required for piping to work.

Another option would be to run this container as an http-server (could be part of a docker-compose for use from another API):

```sh
docker run --rm -p 3000:3000 --security-opt seccomp=unconfined --name svg_to_png marmelab/svg_to_png --http
```

The `--security-opt seccomp=unconfined` is currently required so that we can run chrome inside the container and access it from the API.

## Development

Install dependencies:

```sh
npm install
# or
yarn
```

Build the cli:

```sh
npm run build
```

The built cli will be available in the `./dist` folder.

Build the cli with pkg:

```sh
npm run pkg
```

The built binaries will be available in the `./build` folder.

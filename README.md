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

This only work for the http-server mode. It might be usefull if you want to include it in a docker-compose file for use from another API.

```sh
docker run --rm -p 3000:3000 --security-opt seccomp=unconfined --name svg_to_png marmelab/svg_to_png --http
```

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

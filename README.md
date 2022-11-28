# WebExtensionGenerator
Generates web extensions for you
## Table of Contents

- [Description](#description)
- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Compile](#compile)
  - [Running](#running)
- [Basic Usage](#basic-usage)
- [License](#license)

## Description

`WebExtensionGenerator` is a Deno cli (command-line) tool that allows you to generate webextension/add-ons , similar to what you'd achieve with
[create-web-ext](https://www.npmjs.com/package/create-web-ext) in Node.js. The main differences being that WebExtensionGenerator is designed much more for firefox and includes a typescript option for the extension

## Overview

- Basic manifest and scripts (background, content etc...) generation
- Typescript support (with [Parcel](https://parceljs.org/))
- Generates manifest in version 2 until firefox supports version 3

## Getting Started

There are two main ways to get started:
- Compiling the project and using the executable
- Running it directly from the repo

### Compile

To compile all you need to do is run the [build script](build.sh) and take the version matching your computer.

If you don't want to create multiple versions or you can't run the script directly you can also run the following command from the repo's dir to create the executable:

```sh
  deno compile --allow-run --allow-write --allow-read --allow-net cli.ts 
```

### Running

All you need to do to run the generator is to call the following command:

```sh
  deno run --allow-run --allow-write --allow-read --allow-net cli.ts 
```

This is the same as calling the executable.

## Basic Usage

Once you chose how to run the generator all you need to do is to call it from the command line and input the options you want as it asks.
If you prefer it's also possible to input flags to the generator. 

To see what each flag does run the executable with the ***--help*** flag


## License

This project is licensed under the terms of the [MIT License](LICENSE).

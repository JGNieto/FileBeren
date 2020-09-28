
# FileBeren

[![Preview 0](https://i.gyazo.com/846571d05b77d87aea79e3f1f0a364d4.png)](https://file.beren.dev)

## Helpful Links
- [Live demo version](https://file.beren.dev/)
- [Contact me](mailto:javier@beren.dev?subject=Regarding%20FileBeren)
- [How to create a pull request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)
- [Node.js installation guide](https://nodejs.org/en/download/package-manager/)

## Introduction

Welcome to FileBeren, an open source web app to be installed locally whose purpose is transfering files between devices in a local network, without needing to send an email (that is, of course, if your file is not ridiculously small), uploading it to the cloud (which takes forever) or sending it through some messaging app like WhatsApp (again, only if your file is tiny). All of these approaches take an inefficient route through the internet, even if the devices are meters apart.

It is true that FTP can be used for this purpose, but it requires a special app or program, knowing the other device's IP address and it lacks the simplicity of opening a browser, uploading some files, getting a code, typing it into the other device and simply downloading them. No zipping, no IPs, no special apps, no ridiculously small limits and no hassles, it just works.

If you want to try a demo for yourself, do so at [file.beren.dev](https://file.beren.dev)

## Installation
Installing FileBeren is very simple, just follow the steps below and you will have it going in less than 15 minutes.
If you need any help do not hesitate to contact me via [email](mailto:javier@beren.dev?subject=Regarding%20FileBeren), or simply open an [issue](https://docs.github.com/en/github/managing-your-work-on-github/about-issues) in this repository.

### 1. Installing node.js
FileBeren has been programmed using Node.JS. You can install it on any operating system in the following [link](https://nodejs.org/en/download/package-manager/). 

This project has been developed on Ubuntu and Windows, and the demo runs Centos. It has been tested on node `10.22` and `12.8.3`, but any version newer than 10 should work.

### 2. Installing FileBeren

The installation process, if you can call it that, only involves downloading this repository. You can do it by clicking [this link](https://github.com/BERENGENITA/FileBeren/archive/master.zip) or  by running the following command:

```sh
git clone https://github.com/BERENGENITA/FileBeren.git
```

>Note: this requires installing [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

If you used the command, it will have created a directory called `FileBeren` wherever you run it. Otherwise, extract the zip file.

### 3. Setting up FileBeren

Open the `config.json` file.

```json
{
    "storage_directory": "/home/centos/FileBeren/storage/",
    "code_length": 5,
    "code_lang": "random",
    "directory_char": "/",
    "milliseconds_between_deletion_checks": 3600000,
    "milliseconds_until_deletion": 86400000,
    "port": 80,
    "https": {
        "enabled": false,
        "cert": "/path/to/cert",
        "key": "/path/to/key"
    }
}
```
- `storage_directory` is the directory where the files will be stored. It is recommended that you use an absolute path and the directory **HAS TO EXIST**, otherwise you will get an error. (A windows path would look something like the following: `C:\\Users\\opensauce42\\FileBeren\\storage`)
> Note: this directory can be anywhere in the system, but you need to make shure that the user who runs the program has permission to write, read and delete files in it.
- `code_length` is the length of the codes that identify the uploads. You will understand this better if you use the [live demo](https://file.beren.dev).
- `code_lang` is used to replace random codes with words from a dictionary. Please, leave it as it is.
- `directory_char` is the character, specific to the operating system, that separates directory (i.e. windows' is `\\` and linux's is `/`).
- `milliseconds_between_deletion_checks` is the number of milliseconds between the times when the program runs through the list of uploads and deletes the ones that are too old. It is recommended that you live it as it is (1 hour).
- `milliseconds_until_deletion` is the minimum number of milliseconds since uploading a file in order for it to be deleted (default is 24 hours).
- `port` is the port where the website listens. It is strongly recommended that if you use http, you leave it at 80 and that if you use https you change it to 443.

#### HTTPS configuration:
If you are in a local network it is harder to set up https, but it is an option nevertheless (partly because choice is good and partly because it was necessary for the demo).

If you want to use it just set `enabled` to true and specify where the key and the cert are located.

### 4. Executing the software
In order to execute it, run the following command inside the `FileBeren` directory:
`node index.js`

>Note: if there are any errors, ensure the user who is executing the program has the requiered permissions or just use `sudo node index.js`

You probably want the web app to run continuously. There are many approaches you can take to do this. Some of them are [Linux services](https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6), [screen](https://linuxize.com/post/how-to-use-linux-screen/) and [tmux](https://linuxize.com/post/getting-started-with-tmux/). Eplore them!

## Contributing to this project

If you want to contribute code, documentation or improvements to this very README, do so by creating a pull request. There is a very good tutorial by GitHub [here](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

Even though this is not a requirement, I kindly ask everyone who deploys this system to [email](mailto:fileberen@beren.dev?subject=Regarding%20FileBeren) me, so that I know how many people use it.

If you think improvements need to be done or if you do not like this piece of software altogether, please [email](mailto:fileberen@beren.dev?subject=I%20not%20like%20FileBeren) me or open an issue.

## Legal
This software is granted using an MIT license, the terms of which are described below.

```
Copyright (c) 2020 Javier G. Nieto and contributors
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

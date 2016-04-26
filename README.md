# Robot Home <img align="right" src="http://getrobot.net/common/gh-favicon.png" />
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](http://gruntjs.com)
[![ZLIB Licensed](https://img.shields.io/badge/license-ZLIB-brightgreen.svg)](https://opensource.org/licenses/Zlib)

<p align="justify">Hosts the official <a target="_blank" href="http://getrobot.net">getrobot.net</a> website encompassing all information related to the Robot project. The repository is separated into three branches: The master branch hosts the current live version of the website, the source branch hosts the source files used to compile the website, and the dev branch hosts the source files currently in development. The files in the master branch should never be modified directly as they get overwritten whenever the website gets recompiled, instead, modify the files in the source branch. To compile the website, follow the instructions below.</p>

## Getting Started
Perform the following **once** per machine install
* Download and install <a target="_blank" href="https://nodejs.org">Node.js</a> onto your system
* Open a terminal and install the grunt.js client

```shell
# Verify Node.js install
node -v

# Install Grunt.js client
npm install -g grunt-cli
```
---
Perform the following **once** per source branch pull

```shell
# Navigate to project root
cd path/to/robot.github.io/

# Install the dependencies
npm install
```

## Compiling
<p align="justify">To compile the website, make sure you have followed the getting started guide. Once you have installed node, the grunt.js client, and the project dependencies, compiling the website will be fast and simple. First, make sure your terminal window is pointing to the project root directory. Then use the following commands to compile the website:</p>

```shell
# Compile the entire website
grunt

# Delete all compiled files
grunt clean

# Auto compile changed files
grunt watch
```

## Contributing
See the contributing guide <a target="_blank" href="http://getrobot.net/docs/contributing.html">here</a>.

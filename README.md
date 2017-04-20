# image-diffr

[![Build Status](https://api.travis-ci.org/jhartman86/image-diffr.svg)](http://travis-ci.org/jhartman86/image-diffr)  [![Dependency Status](https://david-dm.org/jhartman86/image-diffr.svg)](https://david-dm.org/jhartman86/image-diffr) [![](http://img.shields.io/npm/v/image-diffr.svg) ![](http://img.shields.io/npm/dm/image-diffr.svg)](https://www.npmjs.org/package/image-diffr)

A simple command line tool for comparing the similarity between two images. Works on PNGs and JPGs. Responds with a weighted percentage of the differences between the images, and/or generates a new image highlighting the differences between the two inputs.

![Alt text](./docs/cli-default.png?raw=true "CLI Output")

#### Inputs &amp; Diff Result

![Alt text](./docs/glasses1.png?raw=true "Diff Images")
![Alt text](./docs/glasses2.png?raw=true "Diff Images")
![Alt text](./docs/glassesDiff.png?raw=true "Diff Images")

**Full credit for the image diff'ing functionality of this goes to [Jimp](https://www.npmjs.com/package/jimp) and related authors. This is effectively a CLI interface around it with some more customized options.**

---

## Installation

    $ npm install -g image-diffr


## CLI Usage

    image-diffr ./path/to/1.png ./path/to/2.png


### CLI Options

  - Threshold `-t [value], --threshold [value]`

    How stringent should the comparison be (from 0 to 1: 0 being perfect match, 1 being pretty damn lack·a·dai·si·cal).

        image-diffr ./path/to/1.png ./path/to/2.png -t 0.25
    
  - Output `-o [path], --output [path]`

    Output an image highlighting the differences between the two input images. The file extension you specify in the name of the output file (.jpg below) should match the input file types.

        image-diffr ./path/to/1.png ./path/to/2.png -o /tmp/diff.jpg
  
  - Quit `-q, --quiet`

    By default, image-diffr will show a few stats (see image above) when run. To silence that business, pass `-q` or `--quiet` and it'll become this:

    ![Alt text](./docs/cli-quiet.png?raw=true "Quit CLI output")
  
  - Help

    Invoke without any arguments

        $: image-diffr

        Options:

        -h, --help                   output usage information
        -V, --version                output the version number
        -t, --threshold [threshold]  Diff comparison threshold (0-1, eg. 0.25)
        -o, --output [output]        Image diff output (absolute path, eg. /tmp/diff-image.jpg)
        -q, --quiet [quiet]          Skip detailed output and show diff percentage only


## Running tests

    npm test


## License

(The MIT License)

Copyright (c) 2017 Fluid, Inc, Jon Hartman &lt;jhartman@fluid.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
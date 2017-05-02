'use strict';

const log       = require('./logger');
const Jimp      = require('jimp');
const path      = require('path');
const fs        = require('fs');
const defaults  = {
  threshold: 0,
  output: null,
  outputOnlyIfDifferent: true,
  quiet: false
};
const errorList = {
  mimeType: 'Image MIME types must match, cannot perform diff.',
  matchWidth: 'Image widths must match, cannot perform diff.',
  matchHeight: 'Image heights must match, cannot perform diff.'
};

/**
 * In order to make this module testable, store the reference to
 * getDiffImage in "_module" const, so we can stub it out. Also export
 * defaults so they're available as the canonical reference for other
 * modules invoking this (eg, CLI).
 */
const _module = module.exports = {
  exec,
  getDiffImage,
  defaults
};

/**
 * 
 * @param {string} filePath1 Absolute or relative file path
 * @param {string} filePath2 Absolute or relative file path
 * @param {object} options {threshold:int, output:string|null, quiet:bool}
 */
function exec(filePath1, filePath2, options) {
  options = Object.assign({}, defaults, options || {});
  const absPath1  = filePath1.search(/http/) === 0 ? 
    filePath1 : path.resolve(filePath1);
  const absPath2  = filePath2.search(/http/) === 0 ? 
    filePath2 : path.resolve(filePath2);
  const verbose   = !options.quiet && process.env.IMAGE_DIFFR_CLI;

  return new Promise((resolve, reject) => {
    Promise
      .all([ Jimp.read(absPath1), Jimp.read(absPath2) ])
      .then(images => { /*eslint complexity: ["error", 10]*/
        const image1 = images[0];
        const image2 = images[1];

        // Give feedback on the images being diffed.
        verbose && log.write('',
          `${log.green('\u2713 Image 1 scanned OK:')}`,
          `  --> ${log.underline('Source')}: ${absPath1}`,
          `  --> ${log.underline('Type')}: ${image1._originalMime}, ${log.underline('Width')}: ${image1.bitmap.width}, ${log.underline('Height')}: ${image1.bitmap.height}`, // eslint-disable-line
          `${log.green('\u2713 Image 2 scanned OK:')}`,
          `  --> ${log.underline('Source')}: ${absPath2}`,
          `  --> ${log.underline('Type')}: ${image2._originalMime}, ${log.underline('Width')}: ${image2.bitmap.width}, ${log.underline('Height')}: ${image2.bitmap.height}` // eslint-disable-line
        );

        // Check that MIME types match, as well as width/height.
        switch (true) {
          case image1._originalMime !== image2._originalMime:
            throw new Error(errorList.mimeType);
          case image1.bitmap.width !== image2.bitmap.width:
            throw new Error(errorList.matchWidth);
          case image1.bitmap.height !== image2.bitmap.height:
            throw new Error(errorList.matchHeight);
        }

        // If we get here, perform the diff and write the output.
        const diff = _module.getDiffImage(image1, image2, options.threshold);

        // Write the diff file to disk?
        if (options.output) {
          if (options.outputOnlyIfDifferent) {
            if (diff.percent !== 0) {
              writeDiff(options, diff, verbose);
            }
          } else {
            writeDiff(options, diff, verbose);
          }
        }

        // Show results
        verbose && log.write('',
          log.underline(`Difference (with threshold ${options.threshold}):`),
          diff.percent <= 0.01 ? log.green(diff.percent) : log.yellow(diff.percent), // eslint-disable-line
          ''
        );

        // If quiet = true AND its the CLI, then show some output
        !verbose && process.env.IMAGE_DIFFR_CLI && log.write(
          `Difference: ${diff.percent}`
        );

        // Resolve promise returned by this function (for module usage)
        resolve(diff);
      })
      .catch(err => {
        verbose && log.write(log.underline.bgRed(err.message));
        reject(err);
      });
  });
}

/**
 * Run a diff on 2 Jimp image instances and return the result. This
 * exists as an independent function in order to stub it out.
 * @param {Jimp.Image} image1 Jimp image instance
 * @param {Jimp.Image} image2 Jimp image instance
 * @param {float} threshold [0-1] tunable threshold (eg, 0.45)
 */
function getDiffImage(image1, image2, threshold) {
  return Jimp.diff(image1, image2, threshold);
}

function writeDiff(options, diff, verbose) {
  const outPath = path.resolve(options.output);
  const dirName = path.dirname(outPath);
  try {
    // statSync will throw error if the parent directory doesn't exist
    fs.statSync(dirName);
    // if we get here, safe to write the image diff to output path
    diff.image.write(outPath);
    verbose && log.write(`${log.green('\u2713')} ${log.bold(`Image diff rendered to file: ${log.underline(outPath)}`)}`); // eslint-disable-line
  } catch (err) {
    verbose && log.write('',
      log.bgRed(err.message),
      log.red('Skipped creating diff image output; parent directory must exist.') // eslint-disable-line
    );
    throw err;
  }
}


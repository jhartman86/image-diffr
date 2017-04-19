const imgDiff = require('ffmpeg-image-diff');
const path    = require('path');
module.exports = { diff };

function diff(filePath1, filePath2) {
  const absPath1 = path.resolve(filePath1);
  const absPath2 = path.resolve(filePath2);
  imgDiff(absPath1, absPath2).then((ssim) => {
    console.log(ssim);
  });
}
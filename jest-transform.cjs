const { extname } = require('path');
const { transform } = require('sucrase');

const SRC_MAP = 'sourceMappingURL';

function getTransforms(filename) {
  const ext = extname(filename);

  switch (ext) {
    case '.ts':
      return ['typescript', 'imports'];
  }
}

module.exports = {
  process(src, filename) {
    const transforms = getTransforms(filename);
    if (!transforms) {
      return src;
    }

    const { code, sourceMap } = transform(src, {
      transforms,
      sourceMapOptions: { compiledFilename: filename },
      filePath: filename,
    });
    const mapBase64 = Buffer.from(JSON.stringify(sourceMap)).toString('base64');
    const suffix = `//# ${SRC_MAP}=data:application/json;charset=utf-8;base64,${mapBase64}`;
    return `${code}\n${suffix}`;
  },
};

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import ignore from 'ignore';
import minimist from 'minimist';
import { relative, join, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = basename(fileURLToPath(import.meta.url));

const opts = minimist(process.argv.slice(2));
const dirs = opts._.length ? opts._ : [process.cwd()];
const depth = opts.depth && parseInt(opts.depth, 10);

const defaultIgnore = ignore().add([
  'lib/',
  'internal/',
  '*.internal.*',
  '*.test.ts',
  '*.stories.ts',
  '*.stories.tsx',
  '*.d.ts',
  '__test__/',
]);

dirs.forEach((x) => makeIndex(x, depth, opts.comment));

function makeIndex(dir, maxDepth, comment) {
  const files = collectFiles(dir, { maxDepth })
    .map((x) => relative(dir, x).replace('\\', '/'))
    .sort(sortPath)
    .filter((x) => x !== 'index');

  if (!comment) {
    comment = `node ${relative(dir, __filename)}`;
  }

  const index = [`// AUTO-GENERATED ${comment}`].concat(
    files.map((x) => `export * from './${x}';`),
  );

  const output = index.join('\n') + '\n';
  const outputFile = join(dir, 'index.ts');

  if (opts.ci) {
    if (readFileSync(outputFile, 'utf8') !== output) {
      console.log(`ERROR: ${outputFile} would change`);
      process.exit(1);
    }
  } else {
    writeFileSync(outputFile, output);
  }
}

function collectFiles(
  dir,
  {
    currentDepth = 0,
    ignoreFiles = defaultIgnore,
    maxDepth = 5,
    rootDir = dir,
  },
) {
  const ignorePath = join(dir, '.indexignore');
  if (existsSync(ignorePath)) {
    ignoreFiles = ignore()
      .add(ignoreFiles)
      .add(readFileSync(ignorePath, 'utf8'));
  }
  let files = readdirSync(dir, { withFileTypes: true });
  const matches = [];

  if (currentDepth > 0 && files.find((x) => x.name === 'index.ts')) {
    return [dir];
  }

  for (const file of files) {
    const relPath = getIgnorePath(dir, file, rootDir);
    if (ignoreFiles && ignoreFiles.ignores(relPath)) {
      continue;
    }
    if (file.isDirectory() && currentDepth <= maxDepth) {
      matches.push(
        ...collectFiles(join(dir, file.name), {
          currentDepth: currentDepth + 1,
          ignoreFiles,
          maxDepth,
          rootDir,
        }),
      );
    } else if (shouldIndexFile(file.name)) {
      matches.push(join(dir, basename(file.name, extname(file.name))));
    }
  }

  return matches;
}

function shouldIndexFile(name) {
  return /\.tsx?$/.test(name);
}

function getIgnorePath(dir, file, rootDir) {
  let filePath = relative(rootDir, join(dir, file.name));
  if (file.isDirectory()) {
    filePath += '/';
  }
  return filePath;
}

function sortPath(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

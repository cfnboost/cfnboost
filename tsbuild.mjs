import { readFileSync, writeFileSync } from 'fs';
import { resolve, join, relative, dirname } from 'path';
import { spawnSync } from 'child_process';
import glob from 'fast-glob';
import { fileURLToPath } from 'url';

const WORKSPACE_ROOT = dirname(fileURLToPath(import.meta.url));
const PACKAGE_JSON = 'package.json';

const INPUT_TSCONFIG = 'tsconfig.build.json';
const OUTPUT_TSCONFIG = 'tsconfig.json';

const rootPkg = JSON.parse(
  readFileSync(join(WORKSPACE_ROOT, PACKAGE_JSON), 'utf-8'),
);

if (
  !rootPkg.workspaces ||
  !Array.isArray(rootPkg.workspaces) ||
  !rootPkg.workspaces.length
) {
  console.error(`ERROR: no workspaces defined`);
  process.exit(1);
}

const packages = rootPkg.workspaces.flatMap((x) =>
  glob.sync(x, { onlyDirectories: true }).map((p) => resolve(p)),
);

if (!packages.length) {
  console.error(
    `ERROR: no packages found in workspaces [${rootPkg.workspaces}]`,
  );
  process.exit(1);
}

const refs = {};

for (const pkg of packages) {
  const packageJsonPath = join(pkg, PACKAGE_JSON);
  let packageJson;

  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  } catch (err) {
    const relPath = relative(WORKSPACE_ROOT, pkg);
    console.warn(`WARN: skipping ${relPath}: error reading package.json`);
    continue;
  }

  const deps = [];
  if (packageJson.dependencies) {
    deps.push(...Object.keys(packageJson.dependencies));
  }
  if (packageJson.devDependencies) {
    deps.push(...Object.keys(packageJson.devDependencies));
  }

  let tsConfig;

  const packageTsConfigPath = join(pkg, INPUT_TSCONFIG);
  try {
    tsConfig = JSON.parse(readFileSync(packageTsConfigPath));
    if (!tsConfig.compilerOptions?.composite) {
      console.warn(
        `skipping ${packageJson.name} because composite is not turned on`,
      );
      continue;
    }
  } catch {
    continue;
  }

  refs[packageJson.name] = {
    name: packageJson.name,
    path: pkg,
    deps,
    tsConfig,
  };
}

for (const pkg of Object.values(refs)) {
  const crossRefs = pkg.deps.filter((x) => x in refs);

  writeFileSync(
    join(pkg.path, OUTPUT_TSCONFIG),
    JSON.stringify(
      {
        $schema: 'https://json.schemastore.org/tsconfig',
        extends: `./${INPUT_TSCONFIG}`,
        compilerOptions: {
          declaration: true,
          composite: true,
        },
        references: crossRefs.map((x) => ({
          path: join(refs[x].path, OUTPUT_TSCONFIG),
        })),
      },
      null,
      2,
    ),
  );
}

writeFileSync(
  join(WORKSPACE_ROOT, OUTPUT_TSCONFIG),
  JSON.stringify(
    {
      $schema: 'https://json.schemastore.org/tsconfig',
      files: [],
      references: Object.values(refs).map((x) => ({
        path: join(x.path, OUTPUT_TSCONFIG),
      })),
    },
    null,
    2,
  ),
);

const result = spawnSync(
  join(WORKSPACE_ROOT, 'node_modules/.bin/tsc'),
  ['-b', join(WORKSPACE_ROOT, OUTPUT_TSCONFIG), ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

process.exit(result.status);

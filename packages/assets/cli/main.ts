import { program } from 'commander';
import { addPackageCommand } from './package.js';

program
  .name('cfnasset')
  .description('CLI to build assets for the cfnboost framework');

addPackageCommand(program);

process.on('beforeExit', () => {
  // if we get here, we didn't manage to get all the way back to the final
  // continuation below, so it's probably an error.
  console.log(`FATAL ERROR: ran out of async continuations`);
  process.exit(99);
});

process.on('unhandledRejection', () => {
  console.log(`FATAL ERROR: unhandled promise rejection`);
  process.exit(90);
});

program.parseAsync().then(
  () => {
    process.exit(0);
  },
  (err) => {
    console.error('FATAL ERROR', err);
    process.exit(1);
  },
);

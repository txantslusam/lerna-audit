#!/usr/bin/env node

const { Command, Option } = require('commander');

const lernaAudit = require('./lib/main');

const { env } = process;
const flags = new Command()
  .addOption(
    new Option(
      '--audit-level [level] default=low',
      'Include a vulnerability with a level as defined or higher',
    )
      .choices(['low', 'moderate', 'high', 'critical'])
      .default('low'),
  )
  .option(
    '--fix [bool] default=false',
    'Audit will try to autofix vunerabilities',
    false,
  )
  .option(
    '--force [bool] default=false',
    'Have audit fix install semver-major updates to toplevel dependencies, not just semver-compatible ones',
    false,
  )
  .addOption(
    new Option('--only [scope]', 'Set package updating scope')
      .choices(['prod', 'dev']),
  )
  .option('--silent [bool]', 'Disable log output', env.LAY_SILENT)
  .option(
    '--verbose [bool]',
    'Switch log level to verbose/debug',
    env.YAF_VERBOSE,
  )
  .option(
    '--report [bool]',
    'Show summary for packages',
    false,
  )
  .option(
    '--report-only [bool]',
    'Run audit for report summary only',
    false,
  )
  .allowUnknownOption()
  .parse(process.argv)
  .opts();

lernaAudit(flags);

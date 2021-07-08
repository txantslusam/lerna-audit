const { run } = require('yarn-audit-fix');
const { spawnSync } = require('child_process');
const { promises } = require('fs');
const { join } = require('path');
const { restorePackageJson } = require('./restore-package-json.function');
const { restoreOriginalPackageJson } = require('./restore-original-package-json.function');
const { savePackageJSON } = require('./save-package-json.function');
const { normalizeFlags } = require('./utils');
const generateReport = require('./generate-report');

let packagePaths;

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});

async function dieGracefully() {
  await restoreOriginalPackageJson(packagePaths);
  process.exit(1);
}
process.on('SIGINT', dieGracefully);
process.on('SIGTERM', dieGracefully);

function getLernaPackages() {
  const result = spawnSync('npx', ['lerna', 'ls', '--all', '--json', '--loglevel=silent'], { stdio: ['pipe', 'pipe', 'inherit'], shell: true });
  if (result.status === 0) {
    return JSON.parse(result.stdout);
  }

  return [];
}

function getPackageFilePaths(path) {
  return {
    backupPath: join(path, 'original-package.json'),
    originalPath: join(path, 'package.json'),
  };
}

function packageInJson(packageNames, name) {
  return packageNames.some((n) => n === name);
}

function packageFilter(originalDepenencies, filter) {
  return Object.entries(originalDepenencies || {})
    .filter(([name]) => filter(name))
    .reduce((filteredDependencies, [name, version]) => ({
      ...filteredDependencies,
      [name]: version,
    }), {});
}

function filterInternalLernaDeps(deps, packageNames) {
  return packageFilter(deps, (name) => packageInJson(packageNames, name));
}

function filterExternalDeps(deps, packageNames) {
  return packageFilter(deps, (name) => !packageInJson(packageNames, name));
}

async function lernaAudit(_flags) {
  const flags = normalizeFlags(_flags);
  const basePath = process.cwd();
  const lernaPackages = getLernaPackages();
  const lernaPackageNames = lernaPackages.map((p) => p.name);
  for (const lernaPackage of lernaPackages) {
    packagePaths = getPackageFilePaths(lernaPackage.location);

    console.log(`Running ${lernaPackage.name}`);

    const packageJson = require(packagePaths.originalPath);
    await promises.rename(packagePaths.originalPath, packagePaths.backupPath);

    const internalLernaDependencies = {
      dependencies: filterInternalLernaDeps(packageJson.dependencies, lernaPackageNames),
      devDependencies: filterInternalLernaDeps(packageJson.devDependencies, lernaPackageNames),
    };

    try {
      const newPackageJson = ({
        ...packageJson,
        dependencies: filterExternalDeps(packageJson.dependencies, lernaPackageNames),
        devDependencies: filterExternalDeps(packageJson.devDependencies, lernaPackageNames),
      });

      await savePackageJSON(lernaPackage.location, newPackageJson);

      console.log(`Run audit in ${lernaPackage.location}`);
      process.chdir(lernaPackage.location);

      await run({
        ...flags,
        cwd: lernaPackage.location,
        flow: 'patch',
      });

      if (flags.report) {
        const auditResult = spawnSync('yarn', ['audit', '--json'], {
          maxBuffer: 10 * 1024 * 1024,
        });

        generateReport(auditResult.stdout.toString(), lernaPackage.name);
      }

      process.chdir(basePath);

      const restoredPackageJson = restorePackageJson(packagePaths, internalLernaDependencies);

      await savePackageJSON(lernaPackage.location, restoredPackageJson);
      await promises.unlink(packagePaths.backupPath);
    } catch (e) {
      console.error(e);
      await restoreOriginalPackageJson(packagePaths);
    }
  }
}

module.exports = lernaAudit;

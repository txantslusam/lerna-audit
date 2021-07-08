const updateRootPackageJson = require('./update-root-package-json');

async function savePackageJSON(path, packageInfo) {
  await updateRootPackageJson({
    path,
    package: packageInfo,
  });
}

module.exports = {
  savePackageJSON,
};

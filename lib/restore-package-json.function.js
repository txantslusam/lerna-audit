function isEmpty(object) {
  return Object.keys(object).length === 0 && object.constructor === Object;
}

function restorePackageJson(packagePaths, internalLernaDependencies) {
  // Need to require package.json of package
  // eslint-disable-next-line import/no-dynamic-require
  let auditedPackageJson = require(packagePaths.originalPath);

  const mergedDependencies = {
    ...auditedPackageJson.dependencies,
    ...internalLernaDependencies.dependencies,
  };

  const mergedDevDependencies = {
    ...auditedPackageJson.devDependencies,
    ...internalLernaDependencies.devDependencies,
  };

  if (!isEmpty(mergedDependencies)) {
    auditedPackageJson = {
      ...auditedPackageJson,
      dependencies: mergedDependencies,
    };
  }

  if (!isEmpty(mergedDevDependencies)) {
    auditedPackageJson = {
      ...auditedPackageJson,
      devDependencies: mergedDevDependencies,
    };
  }

  return auditedPackageJson;
}

module.exports = {
  restorePackageJson,
};

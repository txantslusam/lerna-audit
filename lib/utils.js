const camelToKebab = (string) => string.replace(/([\da-z]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

exports.normalizeFlags = (flags) => Object.keys(flags).reduce((m, key) => {
  /* eslint-disable no-param-reassign */
  m[camelToKebab(key)] = flags[key];
  return m;
  /* eslint-enable no-param-reassign */
}, {});

function attempt(f) {
  try {
    return f();
  } catch (e) {
    return null;
  }
}

function mapReport(data) {
  return data
    .toString()
    .split('\n')
    .map((item) => attempt(() => JSON.parse(item)))
    .filter((item) => item !== null)
    .reduce((reportsObject, currentItem) => {
      /* eslint-disable no-param-reassign */
      if (currentItem.type === 'auditSummary') {
        reportsObject.auditSummary = {
          ...currentItem.data,
        };
      }

      if (currentItem.type === 'auditAdvisory') {
        const { advisory } = currentItem.data;
        const isAlreadyIn = reportsObject.auditAdvisory.find(
          (item) => item.module_name === advisory.module_name,
        );

        if (isAlreadyIn) {
          return reportsObject;
        }

        const processedItem = {
          module_name: advisory.module_name,
          vulnerable_versions: advisory.vulnerable_versions,
          patched_versions: advisory.patched_versions,
          overview: advisory.overview,
          severity: advisory.severity,
        };

        reportsObject.auditAdvisory.push(processedItem);
      }

      return reportsObject;
      /* eslint-enable no-param-reassign */
    }, { auditSummary: {}, auditAdvisory: [] });
}

async function generateReport(flags, output, packageName) {
  const { auditSummary, auditAdvisory } = mapReport(output);
  if (!flags.json) {
    console.log('');
    console.log(`Report for ${packageName}`);
    console.log('Audit Advisories');
    console.log(auditAdvisory);
    console.log('Audit Summary');
    console.log(auditSummary);
  } else {
    console.log(JSON.stringify({ packageName, auditSummary, auditAdvisory }));
  }
}

module.exports = generateReport;

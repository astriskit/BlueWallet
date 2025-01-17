export const semVerToInt = function (semver: string): number {
  if (!semver) return 0;
  if (semver.split('.').length !== 3) return 0;

  const ret = Number(semver.split('.')[0]) * 1000000 + Number(semver.split('.')[1]) * 1000 + Number(semver.split('.')[2]) * 1;

  if (isNaN(ret)) return 0;

  return ret;
};

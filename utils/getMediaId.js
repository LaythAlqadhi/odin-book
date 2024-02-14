const getMediaId = (url) => {
  const lastSlashIndex = url.lastIndexOf('/');
  const lastDotIndex = url.lastIndexOf('.');

  return url.substring(lastSlashIndex + 1, lastDotIndex);
};

module.exports = getMediaId;

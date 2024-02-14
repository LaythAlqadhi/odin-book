const getDataURI = (buffer, mimeType) => {
  const b64 = buffer.toString('base64');
  const dataURI = `data:${mimeType};base64,${b64}`;

  return dataURI;
};

module.exports = getDataURI;

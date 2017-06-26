exports.default = text => (
  text
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '-')
  .replace(/-+/g, '-')
  .substr(0, 50)
  .replace(/^-/g, '')
  .replace(/-$/g, '')
);

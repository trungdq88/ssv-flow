// @format
module.exports = (markdown, link) => {
  let result = markdown
    .split('\n')
    .map(_ =>
      _.replace(/^##\s*(.*?)\*\*(.*?)\*\*(.*?)$/g, '*$1`$2`$3*')
        .replace(/^###\s*(.*?)$/, '*$1*')
        .replace(/\(@(.*?)\)$/, '(<@$1>)')
        .replace(/\[\[/g, '[')
        .replace(/\]\]/g, ']')
        .replace(/\[([^\[]+)\]\(([^\)]+)\)/, '<$1|$2>'),
    )
    .join('\n');

  if (link) {
    const parts = result.split('\n');
    result =
      parts[0].replace(/^(.*?)$/, `<${link}|$1>\n`) +
      parts.slice(1, result.length - 1).join('\n');
  }

  return result;
};

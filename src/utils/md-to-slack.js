// @format
module.exports = markdown => {
  return markdown
    .split('\n')
    .map(_ =>
      _.replace(/^##\s*(.*?)\*\*(.*?)\*\*(.*?)$/g, '*$1`$2`$3*')
        .replace(/^###\s*(.*?)$/, '*$1*')
        .replace(/\(@(.*?)\)$/, '(<@$1>)'),
    )
    .join('\n');
};

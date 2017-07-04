// @format
const showdown = require('showdown');
const converter = new showdown.Converter();

module.exports = text => converter.makeHtml(text);

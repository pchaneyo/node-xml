"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const XML_CHARACTER_MAP = {
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
    '<': '&lt;',
    '>': '&gt;'
};
function escapeForXML(string) {
    return string && string.replace
        ? string.replace(/([&"<>'])/g, function (str, item) {
            return XML_CHARACTER_MAP[item];
        })
        : string;
}
// module.exports = escapeForXML;
exports.default = escapeForXML;

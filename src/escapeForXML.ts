
const XML_CHARACTER_MAP: any = {
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
    '<': '&lt;',
    '>': '&gt;'
};

function escapeForXML(string: string): string {
    return string && string.replace
        ? string.replace(/([&"<>'])/g, function(str, item: string) {
            return XML_CHARACTER_MAP[item];
          })
        : string;
}

// module.exports = escapeForXML;
export default escapeForXML

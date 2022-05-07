"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const escapeForXML_1 = __importDefault(require("./escapeForXML"));
const DEFAULT_INDENT = '    ';
function xml(input, options) {
    if (typeof options !== 'object') {
        options = {
            indent: options
        };
    }
    let output = "";
    const indent = !options.indent ? ''
        : options.indent === true ? DEFAULT_INDENT
            : options.indent;
    function append(interrupt, out) {
        if (out !== undefined) {
            output += out;
        }
        // if (interrupt && !interrupted) {
        //     stream = stream || new Stream();
        //     interrupted = true;
        // }
        // if (interrupt && interrupted) {
        //     var data = output;
        //     delay(function () { stream.emit('data', data) });
        //     output = "";
        // }
    }
    function add(value, last) {
        format(append, resolve(value, indent, indent ? 1 : 0), last);
    }
    function end() {
    }
    function addXmlDeclaration(declaration) {
        const encoding = declaration.encoding || 'UTF-8', attr = { version: '1.0', encoding: encoding };
        if (declaration.standalone) {
            attr.standalone = declaration.standalone;
        }
        add({ '?xml': { _attr: attr } });
        output = output.replace('/>', '?>');
    }
    if (options.declaration) {
        addXmlDeclaration(options.declaration);
    }
    if (input && input.forEach) {
        input.forEach(function (value, i) {
            let last;
            if (i + 1 === input.length)
                last = end;
            add(value, last);
        });
    }
    else {
        add(input, end);
    }
    return output;
}
exports.xml = xml;
function element( /*input, …*/) {
    const input = Array.prototype.slice.call(arguments), self = {
        _elem: resolve(input)
    };
    self.push = function (input) {
        if (!this.append) {
            throw new Error("not assigned to a parent!");
        }
        const that = this;
        const indent = this._elem.indent;
        format(this.append, resolve(input, indent, this._elem.icount + (indent ? 1 : 0)), function () { that.append(true); });
    };
    self.close = function (input) {
        if (input !== undefined) {
            this.push(input);
        }
        if (this.end) {
            this.end();
        }
    };
    return self;
}
exports.element = element;
function create_indent(character, count) {
    return (new Array(count || 0).join(character || ''));
}
function resolve(data, indent, indent_count) {
    indent_count = indent_count || 0;
    const indent_spaces = create_indent(indent, indent_count);
    let name;
    let values = data;
    const interrupt = false;
    if (typeof data === 'object') {
        const keys = Object.keys(data);
        name = keys[0];
        values = data[name];
        if (values && values._elem) {
            values._elem.name = name;
            values._elem.icount = indent_count;
            values._elem.indent = indent;
            values._elem.indents = indent_spaces;
            values._elem.interrupt = values;
            return values._elem;
        }
    }
    const attributes = [], content = [];
    let isStringContent;
    function get_attributes(obj) {
        const keys = Object.keys(obj);
        keys.forEach(function (key) {
            attributes.push(attribute(key, obj[key]));
        });
    }
    switch (typeof values) {
        case 'object':
            if (values === null)
                break;
            if (values._attr) {
                get_attributes(values._attr);
            }
            if (values._cdata) {
                content.push(('<![CDATA[' + values._cdata).replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>');
            }
            if (values.forEach) {
                isStringContent = false;
                content.push('');
                values.forEach(function (value) {
                    if (typeof value == 'object') {
                        const _name = Object.keys(value)[0];
                        if (_name == '_attr') {
                            get_attributes(value._attr);
                        }
                        else {
                            content.push(resolve(value, indent, Number(indent_count) + 1));
                        }
                    }
                    else {
                        //string
                        content.pop();
                        isStringContent = true;
                        content.push(escapeForXML_1.default(value));
                    }
                });
                if (!isStringContent) {
                    content.push('');
                }
            }
            break;
        default:
            //string
            content.push(escapeForXML_1.default(values));
    }
    return {
        name: name,
        interrupt: interrupt,
        attributes: attributes,
        content: content,
        icount: indent_count,
        indents: indent_spaces,
        indent: indent
    };
}
function format(append, elem, end) {
    if (typeof elem != 'object') {
        return append(false, elem);
    }
    const len = elem.interrupt ? 1 : elem.content.length;
    function proceed() {
        while (elem.content.length) {
            const value = elem.content.shift();
            if (value === undefined)
                continue;
            if (interrupt(value))
                return;
            format(append, value);
        }
        append(false, (len > 1 ? elem.indents : '')
            + (elem.name ? '</' + elem.name + '>' : '')
            + (elem.indent && !end ? '\n' : ''));
        if (end) {
            end();
        }
    }
    function interrupt(value) {
        if (value.interrupt) {
            value.interrupt.append = append;
            value.interrupt.end = proceed;
            value.interrupt = false;
            append(true);
            return true;
        }
        return false;
    }
    append(false, elem.indents
        + (elem.name ? '<' + elem.name : '')
        + (elem.attributes.length ? ' ' + elem.attributes.join(' ') : '')
        + (len ? (elem.name ? '>' : '') : (elem.name ? '/>' : ''))
        + (elem.indent && len > 1 ? '\n' : ''));
    if (!len) {
        return append(false, elem.indent ? '\n' : '');
    }
    if (!interrupt(elem)) {
        proceed();
    }
}
function attribute(key, value) {
    return key + '=' + '"' + escapeForXML_1.default(value) + '"';
}
// module.exports = xml;
// module.exports.element = module.exports.Element = element;
exports.default = xml;

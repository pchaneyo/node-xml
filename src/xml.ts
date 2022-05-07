import escapeForXML from './escapeForXML';

const DEFAULT_INDENT = '    ';

export function xml(input?: any, options?: any) {

    if (typeof options !== 'object') {
        options = {
            indent: options
        };
    }

    let output = ""
    const indent: string = !options.indent ? ''
        : options.indent === true ? DEFAULT_INDENT
            : options.indent


    function append(interrupt: any, out: any) {
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

    function add(value: any, last?: any) {
        format(append, resolve(value, indent, indent ? 1 : 0), last);
    }

    function end() {
    }

    function addXmlDeclaration(declaration: any) {
        const encoding = declaration.encoding || 'UTF-8',
            attr: { version: string, encoding: any, standalone?: any } = { version: '1.0', encoding: encoding };

        if (declaration.standalone) {
            attr.standalone = declaration.standalone
        }

        add({ '?xml': { _attr: attr } });
        output = output.replace('/>', '?>');
    }

    if (options.declaration) {
        addXmlDeclaration(options.declaration);
    }

    if (input && input.forEach) {
        input.forEach(function (value: any, i: number) {
            let last: Function | undefined;
            if (i + 1 === input.length)
                last = end;
            add(value, last);
        });
    } else {
        add(input, end);
    }

    return output;
}

export function element(/*input, …*/) {
    const input = Array.prototype.slice.call(arguments),
        self: any = {
            _elem: resolve(input)
        };

    self.push = function (input: any) {
        if (!this.append) {
            throw new Error("not assigned to a parent!");
        }
        const that = this;
        const indent = this._elem.indent;
        format(this.append, resolve(
            input, indent, this._elem.icount + (indent ? 1 : 0)),
            function () { that.append(true) });
    };

    self.close = function (input: any) {
        if (input !== undefined) {
            this.push(input);
        }
        if (this.end) {
            this.end();
        }
    };

    return self;
}

function create_indent(character: string | undefined, count: number) {
    return (new Array(count || 0).join(character || ''))
}

function resolve(data: any, indent?: string, indent_count?: number) {
    indent_count = indent_count || 0;
    const indent_spaces = create_indent(indent, indent_count);
    let name: string | undefined;
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

    const attributes: any[] = [],
        content: any[] = [];

    let isStringContent: boolean;

    function get_attributes(obj: any) {
        const keys = Object.keys(obj);
        keys.forEach(function (key) {
            attributes.push(attribute(key, obj[key]));
        });
    }

    switch (typeof values) {
        case 'object':
            if (values === null) break;

            if (values._attr) {
                get_attributes(values._attr);
            }

            if (values._cdata) {
                content.push(
                    ('<![CDATA[' + values._cdata).replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>'
                );
            }

            if (values.forEach) {
                isStringContent = false;
                content.push('');
                values.forEach(function (value: any) {
                    if (typeof value == 'object') {
                        const _name = Object.keys(value)[0];

                        if (_name == '_attr') {
                            get_attributes(value._attr);
                        } else {
                            content.push(resolve(
                                value, indent, Number(indent_count) + 1));
                        }
                    } else {
                        //string
                        content.pop();
                        isStringContent = true;
                        content.push(escapeForXML(value));
                    }

                });
                if (!isStringContent) {
                    content.push('');
                }
            }
            break;

        default:
            //string
            content.push(escapeForXML(values));

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

function format(append: any, elem: any, end?: any) {

    if (typeof elem != 'object') {
        return append(false, elem);
    }

    const len = elem.interrupt ? 1 : elem.content.length;

    function proceed() {
        while (elem.content.length) {
            const value = elem.content.shift();

            if (value === undefined) continue;
            if (interrupt(value)) return;

            format(append, value);
        }

        append(false, (len > 1 ? elem.indents : '')
            + (elem.name ? '</' + elem.name + '>' : '')
            + (elem.indent && !end ? '\n' : ''));

        if (end) {
            end();
        }
    }

    function interrupt(value: any) {
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

function attribute(key: any, value: any) {
    return key + '=' + '"' + escapeForXML(value) + '"';
}

// module.exports = xml;
// module.exports.element = module.exports.Element = element;

export default xml

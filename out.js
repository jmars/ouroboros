let length = function (v) {
    let i = 0;
    try {
        let e = v[i];
        while (e !== undefined) {
            i = i + 1;
            e = v[i];
        }
        return i;
    }
    catch (e) {
        return i;
    }
};
let indexOf = function (a, v) {
    let i = 0;
    let l = length(a);
    while (i < l) {
        if (a[i] === v) {
            return i;
        }
        i = i + 1;
    }
    return -1;
};
let lastIndexOf = function (a, v) {
    let i = length(a) - 1;
    while (i >= 0) {
        if (a[i] === v) {
            return i;
        }
        i = i - 1;
    }
    return -1;
};
let charVals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
let parseInt = function (str) {
    let i = length(str) - 1;
    let n = 0;
    let e = 1;
    while (i >= 0) {
        let c = str[i];
        n = n + (indexOf(charVals, c) * e);
        e = e * 10;
        i = i - 1;
    }
    return n;
};
let parseFloat = function (str) {
    let h = "";
    let d = "";
    let i = 0;
    let dot = false;
    while (i < length(str)) {
        let c = str[i];
        if (c !== ".") {
            if (dot === false) {
                h = h + c;
            }
            else {
                d = d + c;
            }
        }
        else {
            dot = true;
        }
        i = i + 1;
    }
    return parseInt(h) + (parseInt(d) / (10 ** length(d)));
};
let isFinite = function (n) {
    return n !== Infinity;
};
let ascii = [
    "\b",
    "\t",
    "\n",
    "\f",
    "\r",
    " ",
    "!",
    "\"",
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ":",
    ";",
    "<",
    "=",
    ">",
    "?",
    "@",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "[",
    "\\",
    "]",
    "^",
    "_",
    "`",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "{",
    "|",
    "}",
    "~"
];
let charcode = function (a) {
    let code = indexOf(ascii, a);
    return code;
};
let codechar = function (a) {
    let char = ascii[a];
    return char;
};
let Error = function (msg) {
    return {
        message: msg
    };
};
let tokenize = function (string, prefix, suffix, log) {
    if (string === undefined) {
        return [];
    }
    let i = 0;
    let line = 1;
    let c = charcode(string[i]);
    let len = length(string);
    let n = 0;
    let result = [];
    let str = "";
    let q = charcode("");
    try {
        while (i < len) {
            let from = i;
            if (c <= charcode(" ")) {
                if (c === charcode("\n")) {
                    line = line + 1;
                }
                i = i + 1;
                c = charcode(string[i]);
            }
            else if ((c >= charcode("a") && c <= charcode("z")) || (c >= charcode("A") && c <= charcode("Z"))) {
                str = codechar(c);
                i = i + 1;
                while (true) {
                    c = charcode(string[i]);
                    if ((c >= charcode("a") && c <= charcode("z"))
                        || (c >= charcode("A") && c <= charcode("Z"))
                        || (c >= charcode("0") && c <= charcode("9"))
                        || c === charcode("_")) {
                        str = str + codechar(c);
                        i = i + 1;
                    }
                    else {
                        break;
                    }
                }
                result = [...result, {
                        type: "name",
                        value: str,
                        from: from,
                        to: i,
                        line: line
                    }];
            }
            else if (c >= charcode("0") && c <= charcode("9")) {
                str = codechar(c);
                i = i + 1;
                while (true) {
                    c = charcode(string[i]);
                    if (c < charcode("0") || c > charcode("9")) {
                        break;
                    }
                    i = i + 1;
                    str = str + codechar(c);
                }
                if (c === charcode(".")) {
                    i = i + 1;
                    str = str + codechar(c);
                    while (true) {
                        c = charcode(string[i]);
                        if (c < charcode("0") || c > charcode("9")) {
                            break;
                        }
                        i = i + 1;
                        str = str + codechar(c);
                    }
                }
                if (c === charcode("e") || c === charcode("E")) {
                    i = i + 1;
                    str = str + codechar(c);
                    c = charcode(string[i]);
                    if (c === charcode("-") || c === charcode("+")) {
                        i = i + 1;
                        str = str + codechar(c);
                        c = charcode(string[i]);
                    }
                    if (c < charcode("0") || c > charcode("9")) {
                        throw Error("Bad exponent");
                    }
                    i = i + 1;
                    str = str + codechar(c);
                    c = charcode(string[i]);
                    while (c >= charcode("0") && c <= charcode("9")) {
                        i = i + 1;
                        str = str + codechar(c);
                        c = charcode(string[i]);
                    }
                }
                if (c >= charcode("a") && c <= charcode("z")) {
                    str = str + codechar(c);
                    i = i + 1;
                    throw Error("Bad number");
                }
                n = parseFloat(str);
                if (isFinite(n)) {
                    result = [...result, {
                            type: "number",
                            value: n,
                            from: from,
                            to: i,
                            line: line
                        }];
                }
                else {
                    throw Error("Bad number");
                }
            }
            else if (c === charcode("\"") || c === charcode("'")) {
                str = "";
                q = c;
                i = i + 1;
                while (true) {
                    c = charcode(string[i]);
                    if (c < charcode(" ")) {
                        throw Error("Unterminated/Control character in string");
                    }
                    if (c === q) {
                        break;
                    }
                    if (c === charcode("\\")) {
                        i = i + 1;
                        if (i >= len) {
                            throw Error("Unterminated string");
                        }
                        c = charcode(string[i]);
                        if (c === charcode("b")) {
                            c = charcode("\b");
                        }
                        else if (c === charcode("f")) {
                            c = charcode("\f");
                        }
                        else if (c === charcode("n")) {
                            c = charcode("\n");
                        }
                        else if (c === charcode("r")) {
                            c = charcode("\r");
                        }
                        else if (c === charcode("t")) {
                            c = charcode("\t");
                        }
                        else if (c === charcode("u")) {
                            throw Error("Unicode escapes not supported");
                        }
                    }
                    str = str + codechar(c);
                    i = i + 1;
                }
                i = i + 1;
                result = [...result, {
                        type: "string",
                        value: str,
                        from: from,
                        to: i,
                        line: line
                    }];
                c = charcode(string[i]);
            }
            else if (c === charcode("/") && string[i + 1] === "/") {
                i = i + 1;
                while (true) {
                    c = charcode(string[i]);
                    if (c === charcode("\n") || c === charcode("\r") || c === charcode("")) {
                        break;
                    }
                    i = i + 1;
                }
            }
            else if (indexOf(prefix, codechar(c)) >= 0) {
                str = codechar(c);
                i = i + 1;
                while (true) {
                    c = charcode(string[i]);
                    if (i >= len || indexOf(suffix, codechar(c)) < 0) {
                        break;
                    }
                    str = str + codechar(c);
                    i = i + 1;
                }
                result = [...result, {
                        type: "operator",
                        value: str,
                        from: from,
                        to: i,
                        line: line
                    }];
            }
            else {
                i = i + 1;
                result = [...result, {
                        type: "operator",
                        value: codechar(c),
                        from: from,
                        to: i,
                        line: line
                    }];
                c = charcode(string[i]);
            }
        }
    }
    catch (e) {
        return result;
    }
    return result;
};
let NULL = { type: "Null" };
let UNDEFINED = { type: "Undefined" };
let TRUE = { type: "Boolean", value: true };
let FALSE = { type: "Boolean", value: false };
let StringLiteral = function (value) {
    return { type: "String", value: value };
};
let NumberLiteral = function (value) {
    return { type: "Number", value: value };
};
let SymbolLiteral = function (value) {
    return { type: "Symbol", value: value };
};
let symbol_table = {
    keys: [],
    values: [],
    update: function (self, key, value) {
        let index = indexOf(self.keys, key);
        if (index !== -1) {
            self.values[index] = value;
        }
        else {
            self.keys = [...self.keys, key];
            self.values = [...self.values, value];
        }
        return value;
    },
    read: function (self, key) {
        let index = indexOf(self.keys, key);
        if (index !== -1) {
            return self.values[index];
        }
        else {
            return undefined;
        }
    }
};
let tokens;
let token_nr = 0;
let node;
let line = 1;
let advance = function (id) {
    if (id !== undefined && node.id !== id) {
        throw Error("Expected '" + id + "', got '" + node.id + "'");
    }
    if (token_nr >= length(tokens)) {
        let n = symbol_table.read(symbol_table, "(end)");
        if (n === undefined) {
            throw Error("No end token in symbol table");
        }
        node = n;
        return node;
    }
    let t = tokens[token_nr];
    line = t.line;
    token_nr = token_nr + 1;
    let v = t.value;
    let a = t.type;
    if (a === "name") {
        if (typeof v !== "string") {
            throw Error("Invalid name.");
        }
        let s = symbol_table.read(symbol_table, v);
        if (s !== undefined && typeof s !== "function") {
            return s;
        }
        else {
            return {
                id: "(name)",
                type: "Name",
                lbp: 0,
                value: SymbolLiteral(v),
                nud: function (parselet) {
                    let value = parselet.value;
                    if (value.type !== "Symbol") {
                        throw Error("Unreachable");
                    }
                    return { type: "Name", value: value.value, id: "(name)" };
                },
                led: function () {
                    throw Error("Invalid name token");
                },
                std: null
            };
        }
    }
    else if (a === "operator") {
        if (typeof v !== "string") {
            throw Error("Invalid operator.");
        }
        let o = symbol_table.read(symbol_table, v);
        if (o === undefined) {
            throw Error("Unknown operator.");
        }
        return o;
    }
    else if (a === "string") {
        if (typeof v !== "string") {
            throw Error("Invalid string");
        }
        return {
            id: "(literal)",
            type: "LiteralNode",
            lbp: 0,
            value: StringLiteral(v),
            nud: function (parselet) {
                let value = parselet.value;
                if (value.type !== "String") {
                    throw Error("Unreachable");
                }
                return {
                    type: "LiteralNode",
                    id: "(literal)",
                    value: {
                        type: "String",
                        value: value.value
                    }
                };
            },
            led: function () {
                throw Error("Missing operator.");
            },
            std: null
        };
    }
    else if (a === "number") {
        if (typeof v !== "number") {
            throw Error("Invalid number");
        }
        return {
            id: "(literal)",
            type: "LiteralNode",
            lbp: 0,
            value: NumberLiteral(v),
            nud: function (parselet) {
                let value = parselet.value;
                if (value.type !== "Number") {
                    throw Error("Unreachable");
                }
                return {
                    type: "LiteralNode",
                    id: "(literal)",
                    value: {
                        type: "Number",
                        value: value.value
                    }
                };
            },
            led: function () {
                throw Error("Missing operator.");
            },
            std: null
        };
    }
    else {
        throw Error("unexpected token");
    }
};
let expression = function (rbp) {
    let t = node;
    node = advance(undefined);
    let left = t.nud(t);
    while (rbp < node.lbp) {
        t = node;
        node = advance(undefined);
        left = t.led(t, left);
    }
    return left;
};
let statement = function () {
    let n = node;
    if (n.type === "StatementNode") {
        node = advance(undefined);
        if (n.std === null) {
            throw Error("Statement without handler");
        }
        return n.std(n);
    }
    let v = expression(0);
    if ((v.type !== "BinaryNode" || v.assignment === false) && v.id !== "(") {
        throw Error("Bad expression statement.");
    }
    node = advance(";");
    return v;
};
let statements = function () {
    let a = [];
    let s;
    while (node.id !== "}" && node.id !== "(end)") {
        s = statement();
        if (s !== undefined) {
            a = [...a, s];
        }
    }
    return a;
};
let block = function () {
    let t = node;
    node = advance("{");
    if (t.type === "StatementNode") {
        if (t.std === null) {
            throw Error('Statement without handler');
        }
        return t.std(t);
    }
    else {
        throw Error("Invalid block");
    }
};
let symbol = function (id, bp) {
    bp = bp === undefined ? 0 : bp;
    let s = symbol_table.read(symbol_table, id);
    if (s !== undefined) {
        if (bp >= s.lbp) {
            s.lbp = bp;
        }
        return s;
    }
    else {
        s = {
            type: "LiteralNode",
            id: id,
            lbp: bp,
            value: SymbolLiteral(id),
            nud: function (parselet) {
                throw Error(parselet.id + ": Undefined.");
            },
            led: function (ignore) {
                throw Error("Missing operator.");
            },
            std: null
        };
        symbol_table.update(symbol_table, id, s);
        return s;
    }
};
let constant = function (s, v) {
    let x = symbol(s, undefined);
    x.value = v;
    x.nud = function (parselet) {
        return {
            type: "LiteralNode",
            value: parselet.value,
            id: parselet.id
        };
    };
    return x;
};
let infix = function (id, bp, led) {
    let s = symbol(id, bp);
    s.type = "BinaryNode";
    if (led !== undefined) {
        s.led = led;
    }
    else {
        s.led = function (parselet, left) {
            return {
                type: "BinaryNode",
                left: left,
                right: expression(parselet.lbp),
                assignment: false,
                id: parselet.id
            };
        };
    }
    return s;
};
let infixr = function (id, bp, led) {
    let s = symbol(id, bp);
    if (led !== undefined) {
        s.led = led;
    }
    else {
        s.led = function (parselet, left) {
            return {
                type: "BinaryNode",
                left: left,
                right: expression(parselet.lbp - 1),
                assignment: false,
                id: parselet.id
            };
        };
    }
    return s;
};
let assignment = function (id) {
    return infixr(id, 10, function (parselet, left) {
        if (left.id !== "."
            && left.id !== "["
            && left.type !== "Name") {
            throw Error("Bad lvalue.");
        }
        return {
            type: "BinaryNode",
            id: parselet.id,
            left: left,
            right: expression(0),
            assignment: true
        };
    });
};
let prefix = function (id, nud) {
    let s = symbol(id, undefined);
    if (nud !== undefined) {
        s.nud = nud;
    }
    else {
        s.nud = function (parselet) {
            return {
                type: "UnaryNode",
                id: parselet.id,
                value: expression(70)
            };
        };
    }
    return s;
};
let stmt = function (s, f) {
    let x = symbol(s, undefined);
    x.type = "StatementNode";
    x.std = f;
    return x;
};
symbol("(end)", undefined);
symbol("(name)", undefined);
symbol(":", undefined);
symbol(";", undefined);
symbol(")", undefined);
symbol("]", undefined);
symbol("}", undefined);
symbol(",", undefined);
symbol("else", undefined);
symbol("catch", undefined);
symbol("...", undefined);
constant("true", TRUE);
constant("false", FALSE);
constant("null", NULL);
constant("undefined", UNDEFINED);
symbol("(literal)", undefined);
assignment("=");
infix("?", 20, function (parselet, left) {
    let first = left;
    let second = expression(0);
    node = advance(":");
    let third = expression(0);
    return {
        type: "TernaryNode",
        id: '?',
        first: first,
        second: second,
        third: third
    };
});
infixr("&&", 30, undefined);
infixr("||", 30, undefined);
infixr("===", 40, undefined);
infixr("!==", 40, undefined);
infixr("<", 40, undefined);
infixr("<=", 40, undefined);
infixr(">", 40, undefined);
infixr(">=", 40, undefined);
infix("+", 50, undefined);
infix("-", 50, undefined);
infix("*", 60, undefined);
infix("/", 60, undefined);
infix("**", 70, undefined);
infix(".", 80, function (parselet, left) {
    if (node.type !== "Name") {
        throw Error("Expected a property name.");
    }
    let n = node;
    node = advance(undefined);
    return {
        type: "BinaryNode",
        id: ".",
        left: left,
        right: n.nud(n),
        assignment: false
    };
});
infix("[", 80, function (parselet, left) {
    let n = {
        type: "BinaryNode",
        id: "[",
        left: left,
        right: expression(0),
        assignment: false
    };
    node = advance("]");
    return n;
});
infix("(", 80, function (parselet, left) {
    let a = {
        type: "NodeList",
        id: "(",
        children: []
    };
    let n;
    if ((left.id === "." || left.id === "[") && left.type === "BinaryNode") {
        n = {
            type: "TernaryNode",
            id: "(",
            first: left.left,
            second: left.right,
            third: a
        };
    }
    else {
        n = {
            type: "BinaryNode",
            id: "(",
            left: left,
            right: a,
            assignment: false
        };
        if ((left.type !== "UnaryNode" || left.id !== "function")
            && left.type !== "Name"
            && left.id !== "("
            && left.id !== "&&"
            && left.id !== "||"
            && left.id !== "?") {
            throw Error("Expected a variable name.");
        }
    }
    if (node.id !== ")") {
        while (true) {
            a.children = [...a.children, expression(0)];
            if (node.id !== ",") {
                break;
            }
            node = advance(",");
        }
    }
    node = advance(")");
    return n;
});
prefix("-", undefined);
prefix("typeof", undefined);
prefix("(", function () {
    let e = expression(0);
    node = advance(")");
    return e;
});
prefix("function", function () {
    let n = {
        type: "FunctionNode",
        id: "function",
        name: "",
        parameters: {
            type: "NodeList",
            id: "parameters",
            children: []
        },
        body: {
            type: "NodeList",
            id: "body",
            children: []
        }
    };
    if (node.type === "Name") {
        n.name = node.id;
        node = advance(undefined);
    }
    node = advance("(");
    if (node.id !== ")") {
        while (true) {
            if (node.type !== "Name") {
                throw Error("Expected a parameter name.");
            }
            n.parameters.children = [...n.parameters.children, node.nud(node)];
            node = advance(undefined);
            if (node.id !== ",") {
                break;
            }
            node = advance(",");
        }
    }
    node = advance(")");
    node = advance("{");
    let children = statements();
    if (length(children) === 0 || children[length(children) - 1].id !== "return") {
        children = [...children, {
                type: "StatementNode",
                id: "return",
                value: {
                    type: "LiteralNode",
                    id: "undefined",
                    value: UNDEFINED
                }
            }];
    }
    n.body.children = children;
    node = advance("}");
    return n;
});
prefix("[", function () {
    let a = {
        type: "NodeList",
        id: "[",
        children: []
    };
    if (node.id !== "]") {
        while (true) {
            if (node.id === "...") {
                node = advance("...");
                let v = expression(0);
                a.children = [...a.children, {
                        type: "UnaryNode",
                        id: "...",
                        value: v
                    }];
                if (node.id !== ",") {
                    break;
                }
                node = advance(",");
                continue;
            }
            a.children = [...a.children, expression(0)];
            if (node.id !== ",") {
                break;
            }
            node = advance(",");
        }
    }
    node = advance("]");
    return {
        type: "UnaryNode",
        id: "[",
        value: a
    };
});
prefix("{", function () {
    let a = { type: "NodeList", children: [], id: '{' };
    if (node.id !== "}") {
        while (true) {
            let n = node;
            let v;
            if (n.id === "...") {
                node = advance('...');
                v = expression(0);
                a.children = [...a.children, {
                        type: "UnaryNode",
                        id: "...",
                        value: v
                    }];
                if (node.id !== ",") {
                    break;
                }
                node = advance(",");
                continue;
            }
            if (n.type !== "Name" && n.type !== "LiteralNode") {
                throw Error("Bad property name.");
            }
            let kn = n.nud(n);
            node = advance(undefined);
            node = advance(":");
            v = expression(0);
            a.children = [...a.children, {
                    type: "BinaryNode",
                    assignment: false,
                    id: ":",
                    left: kn,
                    right: v
                }];
            if (node.id !== ",") {
                break;
            }
            node = advance(",");
        }
    }
    node = advance("}");
    return {
        type: "UnaryNode",
        id: "{",
        value: a
    };
});
stmt("{", function () {
    let n = {
        type: "NodeList",
        id: "{",
        children: statements()
    };
    node = advance("}");
    return {
        type: "StatementNode",
        id: "{",
        value: n
    };
});
stmt("throw", function () {
    let n = {
        type: "StatementNode",
        id: "throw",
        value: expression(0)
    };
    node = advance(';');
    return n;
});
stmt("let", function () {
    let n = node.nud(node);
    if (n.type !== "Name") {
        throw Error("Expected a new variable name.");
    }
    node = advance(undefined);
    if (node.id === ";") {
        node = advance(";");
        return {
            type: "BinaryNode",
            assignment: true,
            id: "let",
            left: n,
            right: {
                type: "LiteralNode",
                id: "undefined",
                value: UNDEFINED
            }
        };
    }
    node = advance("=");
    let assignment = {
        type: "BinaryNode",
        assignment: true,
        id: "let",
        left: n,
        right: expression(0)
    };
    node = advance(";");
    return assignment;
});
stmt("if", function () {
    node = advance("(");
    let first = expression(0);
    node = advance(")");
    let second = block();
    let third;
    if (node.id === "else") {
        node = advance("else");
        if (node.id === "if") {
            third = statement();
        }
        else {
            third = block();
        }
    }
    else {
        third = {
            type: "StatementNode",
            id: '{',
            value: {
                type: 'NodeList',
                id: '{',
                children: []
            }
        };
    }
    return {
        type: "TernaryNode",
        id: "if",
        first: first,
        second: second,
        third: third
    };
});
stmt("try", function () {
    let first = block();
    node = advance("catch");
    node = advance("(");
    let second = expression(0);
    node = advance(")");
    let third = block();
    return {
        type: "TernaryNode",
        id: "try",
        first: first,
        second: second,
        third: third
    };
});
stmt("return", function () {
    let n;
    if (node.id !== ";") {
        n = {
            type: "StatementNode",
            id: "return",
            value: expression(0)
        };
        node = advance(';');
    }
    else {
        n = {
            type: "StatementNode",
            id: "return",
            value: {
                type: "LiteralNode",
                id: "undefined",
                value: UNDEFINED
            }
        };
        node = advance(";");
        if (node.id !== "}") {
            throw Error("Unreachable statement.");
        }
    }
    return n;
});
stmt("break", function () {
    node = advance(";");
    if (node.id !== "}") {
        throw Error("Unreachable statement.");
    }
    return {
        type: "StatementNode",
        id: "break",
        value: {
            type: "Name",
            id: "break",
            value: "break"
        }
    };
});
stmt("continue", function () {
    node = advance(";");
    if (node.id !== "}") {
        throw Error("Unreachable statement.");
    }
    return {
        type: "StatementNode",
        id: "continue",
        value: {
            type: "Name",
            id: "continue",
            value: "continue"
        }
    };
});
stmt("while", function () {
    node = advance("(");
    let left = expression(0);
    node = advance(")");
    let right = block();
    return {
        type: "StatementNode",
        id: "while",
        value: {
            type: "BinaryNode",
            id: "while",
            left: left,
            right: right,
            assignment: false
        }
    };
});
let parse = function (tokenized) {
    tokens = tokenized;
    token_nr = 0;
    node = advance(undefined);
    let s = statements();
    node = advance("(end)");
    return s;
};
let LiteralStringInterplet = function (v) {
    return {
        value: v,
        interpret: function (self) {
            return self.value;
        }
    };
};
let LiteralNumberInterplet = function (v) {
    return {
        value: v,
        interpret: function (self) {
            return self.value;
        }
    };
};
let LiteralBooleanInterplet = function (v) {
    return {
        value: v,
        interpret: function (self) {
            return self.value;
        }
    };
};
let LiteralNullInterplet = function () {
    return {
        interpret: function (self) {
            return null;
        }
    };
};
let LiteralUndefinedInterplet = function () {
    return {
        interpret: function (self) {
            return undefined;
        }
    };
};
let LiteralArrayInterplet = function (v) {
    return {
        expressions: v,
        interpret: function (self, frame) {
            let result = [];
            let i = 0;
            let l = length(self.expressions);
            while (i < l) {
                let expr = self.expressions[i];
                let value = expr.interpret(expr, frame);
                if (value !== null && typeof value === "object" && value.type === "spread") {
                    let spread = value.value;
                    if (spread.type === "array") {
                        result = [...result, ...spread.values];
                    }
                    else {
                        throw Error("Cannot spread an object into an array");
                    }
                }
                else {
                    result = [...result, value];
                }
                i = i + 1;
            }
            return {
                type: "array",
                values: result,
                length: length(result)
            };
        }
    };
};
let LiteralObjectInterplet = function (keys, values) {
    return {
        keys: keys,
        values: values,
        interpret: function (self, frame) {
            let keys = [];
            let values = [];
            let i = 0;
            let l = length(self.keys);
            while (i < l) {
                let key = self.keys[i];
                let value = self.values[i].interpret(self.values[i], frame);
                if (typeof key !== "string") {
                    throw Error("Invalid object key");
                }
                if (value !== null && typeof value === "object" && value.type === "spread") {
                    let spread = value.value;
                    if (spread.type === "object") {
                        keys = [...keys, ...spread.keys];
                        values = [...values, ...spread.values];
                    }
                    else {
                        throw Error("Only objects can be spread into objects");
                    }
                }
                else {
                    keys = [...keys, key];
                    values = [...values, value];
                }
                i = i + 1;
            }
            return {
                type: "object",
                values: values,
                keys: keys
            };
        }
    };
};
let AssignmentInterplet = function (name, value) {
    return {
        name: name,
        value: value,
        interpret: function (self, frame) {
            let v = self.value.interpret(self.value, frame);
            let current = frame;
            let index = -1;
            while (current !== null) {
                index = lastIndexOf(current.locals, self.name);
                if (index !== -1) {
                    break;
                }
                if (current.parent === null) {
                    throw Error("Assignment to undeclared variable");
                }
                current = current.parent;
            }
            current.values[index] = v;
            return v;
        }
    };
};
let ObjectAssignmentInterplet = function (target, name, value) {
    return {
        target: target,
        name: name,
        value: value,
        interpret: function (self, frame) {
            let v = self.value.interpret(self.value, frame);
            let target = self.target.interpret(self.target, frame);
            if (target === null || typeof target !== "object" || target.type !== "object") {
                throw Error("Can only assign to objects");
            }
            let index = lastIndexOf(target.keys, self.name);
            if (index === -1) {
                throw Error("Assignment to missing key");
            }
            target.values[index] = v;
            return v;
        }
    };
};
let LetInterplet = function (name, value) {
    return {
        name: name,
        value: value,
        interpret: function (self, frame) {
            let v = self.value.interpret(self.value, frame);
            let exists = indexOf(frame.locals, self.name);
            if (exists >= 0) {
                throw Error("Cannot redeclare let-scoped variable: " + self.name);
            }
            frame.locals = [...frame.locals, self.name];
            frame.values = [...frame.values, v];
            return v;
        }
    };
};
let NameInterplet = function (name) {
    return {
        name: name,
        interpret: function (self, frame) {
            let current = frame;
            while (current !== null) {
                let index = lastIndexOf(current.locals, self.name);
                if (index >= 0) {
                    return current.values[index];
                }
                if (current.parent === null) {
                    throw Error("Attempt to access undeclared variable");
                }
                current = current.parent;
            }
        }
    };
};
let operators = ["+", "-", "/", "*", "**", ">", ">=", "<", "<=", "&&", "||", "===", "!=="];
let OperatorInterplet = function (operator, left, right) {
    return {
        operator: operator,
        left: left,
        right: right,
        interpret: function (self, frame) {
            let left = self.left.interpret(self.left, frame);
            if (self.operator === "&&" || self.operator === "||") {
                if (typeof left !== "boolean") {
                    throw Error("&& or || values must be boolean");
                }
                if (self.operator === "&&") {
                    if (left === true) {
                        let r = self.right.interpret(self.right, frame);
                        if (typeof r !== "boolean") {
                            throw Error("&& or || values must be boolean");
                        }
                        return r;
                    }
                    return false;
                }
                else {
                    if (left === true) {
                        return true;
                    }
                    let r = self.right.interpret(self.right, frame);
                    if (typeof r !== "boolean") {
                        throw Error("&& or || values must be boolean");
                    }
                    return r;
                }
            }
            let right = self.right.interpret(self.right, frame);
            if (self.operator === "===") {
                return left === right;
            }
            else if (self.operator === "!==") {
                return left !== right;
            }
            else {
                if (typeof left === "string" && typeof right === "string" && self.operator === "+") {
                    return left + right;
                }
                if (typeof left !== "number" || typeof right !== "number") {
                    throw Error("Arithmetic can only be performed on numbers");
                }
                if (self.operator === "+") {
                    return left + right;
                }
                else if (self.operator === '-') {
                    return left - right;
                }
                else if (self.operator === "/") {
                    return left / right;
                }
                else if (self.operator === "*") {
                    return left * right;
                }
                else if (self.operator === "**") {
                    return left ** right;
                }
                else if (self.operator === ">") {
                    return left > right;
                }
                else if (self.operator === ">=") {
                    return left >= right;
                }
                else if (self.operator === "<") {
                    return left < right;
                }
                else if (self.operator === "<=") {
                    return left <= right;
                }
            }
        }
    };
};
let FunctionInterplet = function (parameters, body) {
    return {
        parameters: parameters,
        body: body,
        interpret: function (self) {
            return {
                type: "function",
                parameters: self.parameters,
                body: self.body
            };
        }
    };
};
let ReturnInterplet = function (value) {
    return {
        value: value,
        interpret: function (self, frame) {
            let ret = self.value.interpret(self.value, frame);
            throw {
                type: 'return',
                value: ret
            };
        }
    };
};
let CallInterplet = function (func, args) {
    return {
        func: func,
        args: args,
        interpret: function (self, frame) {
            let f = self.func.interpret(self.func, frame);
            if (f === null || typeof f !== "object" || f.type !== "function" && f.type !== "nativefunction") {
                throw Error("Attempt to call non-function");
            }
            let i = 0;
            let locals = [];
            let values = [];
            let argI = length(self.args);
            let l = length(f.parameters);
            while (i < l) {
                if (i >= argI) {
                    throw Error("Not enough arguments");
                }
                let a = self.args[i];
                locals = [...locals, f.parameters[i]];
                values = [...values, a.interpret(a, frame)];
                i = i + 1;
            }
            if (f.type === "nativefunction") {
                return f.body(values[0]);
            }
            let stack = {
                locals: locals,
                values: values,
                parent: frame
            };
            i = 0;
            l = length(f.body);
            while (i < l) {
                let s = f.body[i];
                try {
                    s.interpret(s, stack);
                }
                catch (err) {
                    if (typeof err === "object" && err.type === "return") {
                        return err.value;
                    }
                    throw err;
                }
                i = i + 1;
            }
            return undefined;
        }
    };
};
let MethodCallInterplet = function (obj, func, args) {
    return {
        obj: obj,
        func: func,
        args: args,
        interpret: function (self, frame) {
            let obj = self.obj.interpret(self.obj, frame);
            if (obj === null || typeof obj !== "object" || obj.type !== "object") {
                throw Error("Method calls are only allowed on objects");
            }
            let f = obj.values[indexOf(obj.keys, self.func)];
            if (f === null || typeof f !== "object" || f.type !== "function") {
                throw Error("Attempt to call non-function");
            }
            let i = 0;
            let locals = [];
            let values = [];
            let argI = length(self.args);
            let l = length(f.parameters);
            while (i < l) {
                if (i >= argI) {
                    throw Error("Not enough arguments");
                }
                let a = self.args[i];
                locals = [...locals, f.parameters[i]];
                values = [...values, a.interpret(a, frame)];
                i = i + 1;
            }
            let stack = {
                locals: locals,
                values: values,
                parent: frame
            };
            i = 0;
            l = length(f.body);
            while (i < l) {
                let s = f.body[i];
                try {
                    s.interpret(s, stack);
                }
                catch (err) {
                    if (typeof err === "object" && err.type === "return") {
                        return err.value;
                    }
                    throw err;
                }
                i = i + 1;
            }
            return undefined;
        }
    };
};
let IndexInterplet = function (target, index) {
    return {
        target: target,
        index: index,
        interpret: function (self, frame) {
            let target = self.target.interpret(self.target, frame);
            let index = self.index.interpret(self.index, frame);
            if (target !== null && typeof target === "object") {
                if (target.type === "array" && typeof index === "number") {
                    if (index >= length(target.values)) {
                        throw Error("Out of bounds index");
                    }
                    else {
                        return target.values[index];
                    }
                }
                else if (target.type === "function") {
                    throw Error("Cannot index function");
                }
                else if (target.type === "object") {
                    if (typeof index !== "string") {
                        throw Error("Objects can only be indexed by strings");
                    }
                    if (indexOf(target.keys, index) === -1) {
                        throw Error("Key does not exist on object");
                    }
                    return target.values[indexOf(target.keys, index)];
                }
            }
            else if (typeof target === "string" && typeof index === "number") {
                if (index >= length(target)) {
                    throw Error("Out of bounds index");
                }
                else {
                    return target[index];
                }
            }
        }
    };
};
let DotInterplet = function (target, key) {
    return {
        target: target,
        key: key,
        interpret: function (self, frame) {
            let target = self.target.interpret(self.target, frame);
            if (target === null || typeof target !== "object" || target.type !== "object") {
                throw Error("Dot syntax can only be used on objects");
            }
            if (indexOf(target.keys, self.key) === -1) {
                throw Error("Key does not exist on object");
            }
            return target.values[indexOf(target.keys, self.key)];
        }
    };
};
let WhileInterplet = function (condition, block) {
    return {
        condition: condition,
        block: block,
        interpret: function (self, frame) {
            while (true) {
                let stack = {
                    locals: [],
                    values: [],
                    parent: frame
                };
                let condition = self.condition.interpret(self.condition, frame);
                if (typeof condition !== "boolean") {
                    throw Error("Invalid while condition");
                }
                if (condition === false) {
                    break;
                }
                try {
                    let i = 0;
                    let l = length(self.block);
                    while (i < l) {
                        self.block[i].interpret(self.block[i], stack);
                        i = i + 1;
                    }
                }
                catch (e) {
                    if (e === "break") {
                        break;
                    }
                    if (e === "continue") {
                        continue;
                    }
                    throw e;
                }
            }
            return undefined;
        }
    };
};
let BreakInterplet = function () {
    return {
        interpret: function (self, frame) {
            throw "break";
        }
    };
};
let ContinueInterplet = function () {
    return {
        interpret: function (self, frame) {
            throw "continue";
        }
    };
};
let TryInterplet = function (block, name, handler) {
    return {
        block: block,
        name: name,
        handler: handler,
        interpret: function (self, frame) {
            let i = 0;
            let l = 0;
            try {
                let block = self.block;
                l = length(block);
                let stack = {
                    locals: [],
                    values: [],
                    parent: frame
                };
                while (i < l) {
                    block[i].interpret(block[i], stack);
                    i = i + 1;
                }
                return undefined;
            }
            catch (err) {
                let stack = {
                    locals: [self.name],
                    values: [err],
                    parent: frame
                };
                let handler = self.handler;
                i = 0;
                l = length(handler);
                while (i < l) {
                    handler[i].interpret(handler[i], stack);
                    i = i + 1;
                }
                return undefined;
            }
        }
    };
};
let ThrowInterplet = function (err) {
    return {
        err: err,
        interpret: function (self, frame) {
            throw self.err.interpret(self.err, frame);
        }
    };
};
let IfInterplet = function (condition, ifTrue, ifFalse) {
    return {
        condition: condition,
        ifTrue: ifTrue,
        ifFalse: ifFalse,
        interpret: function (self, frame) {
            let condition = self.condition.interpret(self.condition, frame);
            if (typeof condition !== "boolean") {
                throw Error("Invalid if condition: must be boolean");
            }
            let block = self.ifFalse;
            if (condition) {
                block = self.ifTrue;
            }
            let i = 0;
            let l = length(block);
            let stack = {
                locals: [],
                values: [],
                parent: frame
            };
            while (i < l) {
                let n = block[i];
                n.interpret(n, stack);
                i = i + 1;
            }
            return undefined;
        }
    };
};
let TernaryIfInterplet = function (condition, ifTrue, ifFalse) {
    return {
        condition: condition,
        ifTrue: ifTrue,
        ifFalse: ifFalse,
        interpret: function (self, frame) {
            let condition = self.condition.interpret(self.condition, frame);
            if (typeof condition !== "boolean") {
                throw Error("Invalid if condition: must be boolean");
            }
            let expr = self.ifFalse;
            if (condition) {
                expr = self.ifTrue;
            }
            return expr.interpret(expr, frame);
        }
    };
};
let NegativeInterplet = function (value) {
    return {
        value: value,
        interpret: function (self, frame) {
            let result = self.value.interpret(self.value, frame);
            if (typeof result !== "number") {
                throw Error("Invalid negative value: must be a number");
            }
            return -result;
        }
    };
};
let TypeofInterplet = function (value) {
    return {
        value: value,
        interpret: function (self, frame) {
            try {
                let result = self.value.interpret(self.value, frame);
                if (result !== null && typeof result === "object" && result.type === "function") {
                    return "function";
                }
                else {
                    return typeof result;
                }
            }
            catch (err) {
                return typeof undefined;
            }
        }
    };
};
let SpreadInterplet = function (value) {
    return {
        value: value,
        interpret: function (self, frame) {
            let target = self.value.interpret(self.value, frame);
            if (target === null || typeof target !== "object" || (target.type !== "array" && target.type !== "object")) {
                throw Error("Can only spread objects and arrays");
            }
            return {
                type: "spread",
                value: target
            };
        }
    };
};
let createInterp = function (parsed) {
    if (parsed.type === "LiteralNode") {
        let value = parsed.value;
        if (value.type === "Boolean") {
            return LiteralBooleanInterplet(value.value);
        }
        else if (value.type === "Null") {
            return LiteralNullInterplet();
        }
        else if (value.type === "Number") {
            return LiteralNumberInterplet(value.value);
        }
        else if (value.type === "String") {
            return LiteralStringInterplet(value.value);
        }
        else if (value.type === "Undefined") {
            return LiteralUndefinedInterplet();
        }
    }
    else if (parsed.type === "BinaryNode") {
        if (parsed.id === "=" && parsed.assignment) {
            let left = parsed.left;
            let right = parsed.right;
            if (left.type !== "Name") {
                if (left.type !== "BinaryNode") {
                    throw Error("Invalid assignment");
                }
                let name = left.right;
                if (name.type !== "Name") {
                    throw Error("Invalid assignment");
                }
                let target = left.left;
                return ObjectAssignmentInterplet(createInterp(target), name.value, createInterp(right));
            }
            return AssignmentInterplet(left.value, createInterp(right));
        }
        else if (parsed.id === "let" && parsed.assignment) {
            let left = parsed.left;
            let right = createInterp(parsed.right);
            if (left.type !== "Name") {
                throw Error("Invalid assignment name");
            }
            return LetInterplet(left.value, right);
        }
        else if (indexOf(operators, parsed.id) > -1) {
            let left = createInterp(parsed.left);
            let right = createInterp(parsed.right);
            return OperatorInterplet(parsed.id, left, right);
        }
        else if (parsed.id === "(") {
            let left = createInterp(parsed.left);
            let right = parsed.right;
            if (right.type !== "NodeList") {
                throw Error("Invalid function call");
            }
            let args = [];
            let i = 0;
            let l = length(right.children);
            while (i < l) {
                let a = createInterp(right.children[i]);
                args = [...args, a];
                i = i + 1;
            }
            return CallInterplet(left, args);
        }
        else if (parsed.id === '[') {
            let left = createInterp(parsed.left);
            let right = createInterp(parsed.right);
            return IndexInterplet(left, right);
        }
        else if (parsed.id === ".") {
            let left = createInterp(parsed.left);
            let right = parsed.right;
            if (right.type !== "Name") {
                throw Error("Invalid dot access");
            }
            return DotInterplet(left, right.value);
        }
    }
    else if (parsed.type === "Name") {
        return NameInterplet(parsed.value);
    }
    else if (parsed.type === "UnaryNode") {
        if (parsed.id === "{") {
            let keys = [];
            let values = [];
            let i = 0;
            let value = parsed.value;
            if (value.type !== "NodeList") {
                throw Error("Invalid object literal");
            }
            let children = value.children;
            let l = length(children);
            while (i < l) {
                let node = children[i];
                if (node.id === "..." && node.type === "UnaryNode") {
                    keys = [...keys, ""];
                    values = [...values, createInterp(node)];
                    i = i + 1;
                    continue;
                }
                if (node.type !== "BinaryNode" || node.id !== ":") {
                    throw Error("Invalid object key value pair");
                }
                let left = node.left;
                if (left.type !== "Name") {
                    throw Error("Invalid object key");
                }
                keys = [...keys, left.value];
                values = [...values, createInterp(node.right)];
                i = i + 1;
            }
            return LiteralObjectInterplet(keys, values);
        }
        else if (parsed.id === "[") {
            let values = [];
            let i = 0;
            let value = parsed.value;
            if (value.type !== "NodeList") {
                throw Error("Invalid array literal");
            }
            let children = value.children;
            let l = length(children);
            while (i < l) {
                let node = children[i];
                values = [...values, createInterp(node)];
                i = i + 1;
            }
            return LiteralArrayInterplet(values);
        }
        else if (parsed.id === "-") {
            let value = createInterp(parsed.value);
            return NegativeInterplet(value);
        }
        else if (parsed.id === "typeof") {
            let value = createInterp(parsed.value);
            return TypeofInterplet(value);
        }
        else if (parsed.id === "...") {
            let value = createInterp(parsed.value);
            return SpreadInterplet(value);
        }
    }
    else if (parsed.type === "FunctionNode") {
        let parameters = [];
        let body = [];
        let i = 0;
        let l = length(parsed.parameters.children);
        while (i < l) {
            let node = parsed.parameters.children[i];
            if (node.type !== "Name") {
                throw Error("Invalid function parameter");
            }
            parameters = [...parameters, node.value];
            i = i + 1;
        }
        i = 0;
        l = length(parsed.body.children);
        while (i < l) {
            let node = parsed.body.children[i];
            let interp = createInterp(node);
            body = [...body, interp];
            i = i + 1;
        }
        return FunctionInterplet(parameters, body);
    }
    else if (parsed.type === "StatementNode") {
        if (parsed.id === "return") {
            return ReturnInterplet(createInterp(parsed.value));
        }
        else if (parsed.id === "while") {
            let value = parsed.value;
            if (value.type !== "BinaryNode") {
                throw Error("Invalid while loop");
            }
            let left = createInterp(value.left);
            let right = value.right;
            if (right.type !== "StatementNode") {
                throw Error("Invalid while block");
            }
            let body = right.value;
            if (body.type !== "NodeList") {
                throw Error("Invalid while body");
            }
            let i = 0;
            let block = [];
            let l = length(body.children);
            while (i < l) {
                block = [...block, createInterp(body.children[i])];
                i = i + 1;
            }
            return WhileInterplet(left, block);
        }
        else if (parsed.id === "break") {
            return BreakInterplet();
        }
        else if (parsed.id === "continue") {
            return ContinueInterplet();
        }
        else if (parsed.id === "throw") {
            let err = createInterp(parsed.value);
            return ThrowInterplet(err);
        }
    }
    else if (parsed.type === "TernaryNode") {
        if (parsed.id === "try") {
            let first = parsed.first;
            if (first.type !== "StatementNode") {
                throw Error("Invalid try block");
            }
            first = first.value;
            if (first.type !== "NodeList") {
                throw Error("Invalid try block");
            }
            let second = parsed.second;
            if (second.type !== "Name") {
                throw Error("Invalid catch block variable name");
            }
            let third = parsed.third;
            if (third.type !== "StatementNode") {
                throw Error("Invalid catch block");
            }
            third = third.value;
            if (third.type !== "NodeList") {
                throw Error("Invalid catch block");
            }
            let block = [];
            let i = 0;
            let l = length(first.children);
            while (i < l) {
                block = [...block, createInterp(first.children[i])];
                i = i + 1;
            }
            let guard = [];
            i = 0;
            l = length(third.children);
            while (i < l) {
                guard = [...guard, createInterp(third.children[i])];
                i = i + 1;
            }
            return TryInterplet(block, second.value, guard);
        }
        else if (parsed.id === "if") {
            let expr = createInterp(parsed.first);
            let ifTrue = parsed.second;
            if (ifTrue.type !== "StatementNode") {
                throw Error("Invalid if true block");
            }
            ifTrue = ifTrue.value;
            if (ifTrue.type !== "NodeList") {
                throw Error("Invalid if true block");
            }
            let trueBlock = [];
            let i = 0;
            let l = length(ifTrue.children);
            while (i < l) {
                trueBlock = [...trueBlock, createInterp(ifTrue.children[i])];
                i = i + 1;
            }
            let ifFalse = parsed.third;
            if (ifFalse.id === "if") {
                return IfInterplet(expr, trueBlock, [createInterp(ifFalse)]);
            }
            if (ifFalse.type !== "StatementNode") {
                throw Error("Invalid if false block");
            }
            ifFalse = ifFalse.value;
            if (ifFalse.type !== "NodeList") {
                throw Error("Invalid if false block");
            }
            let falseBlock = [];
            i = 0;
            l = length(ifFalse.children);
            while (i < l) {
                falseBlock = [...falseBlock, createInterp(ifFalse.children[i])];
                i = i + 1;
            }
            return IfInterplet(expr, trueBlock, falseBlock);
        }
        else if (parsed.id === "(") {
            let first = createInterp(parsed.first);
            let second = parsed.second;
            if (second.type !== "Name") {
                throw Error("Invalid method name");
            }
            let third = parsed.third;
            if (third.type !== "NodeList") {
                throw Error("Invalid function call");
            }
            let args = [];
            let i = 0;
            let l = length(third.children);
            while (i < l) {
                let a = createInterp(third.children[i]);
                args = [...args, a];
                i = i + 1;
            }
            return MethodCallInterplet(first, second.value, args);
        }
        else if (parsed.id === "?") {
            let condition = createInterp(parsed.first);
            let ifTrue = createInterp(parsed.second);
            let ifFalse = createInterp(parsed.third);
            return TernaryIfInterplet(condition, ifTrue, ifFalse);
        }
    }
    throw Error("failed");
};
let main = function (rFS, log, native) {
    let source = rFS('./out.js', 'utf-8');
    let prefix = ['=', '<', '>', '!', '+', '-', '*', '&', '|', '/', '%', '^', '.'];
    let suffix = ['=', '<', '>', '&', '|', '.', '*'];
    log('tokenizing');
    let tokens = tokenize(source, prefix, suffix, log);
    log('parsing');
    let tree = parse(tokens);
    let frame = {
        locals: ['Infinity'],
        values: [Infinity],
        parent: null
    };
    let i = 0;
    let l = length(tree);
    log('interpreting');
    while (i < l) {
        let node = tree[i];
        let interp = createInterp(node);
        interp.interpret(interp, frame);
        i = i + 1;
    }
    if (native) {
        log('starting');
        let meta = frame.values[indexOf(frame.locals, 'main')];
        if (meta === null || typeof meta !== "object" || meta.type !== "function") {
            log("Invalid main function");
            return;
        }
        let ilog = {
            type: "nativefunction",
            body: function (arg) {
                log("|: " + arg);
            },
            parameters: ['string']
        };
        let iread = {
            type: "nativefunction",
            body: function (path) {
                return rFS(path, 'utf-8');
            },
            parameters: ['path']
        };
        let stack = {
            locals: ['rFS', 'log', 'native'],
            values: [iread, ilog, false],
            parent: frame
        };
        i = 0;
        l = length(meta.body);
        while (i < l) {
            let s = meta.body[i];
            try {
                s.interpret(s, stack);
            }
            catch (err) {
                log(JSON.stringify(err, null, 2));
                log(err);
                return;
            }
            i = i + 1;
        }
    }
};
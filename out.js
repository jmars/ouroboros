let length = function (v) {
    let i = 0;
    let e = v[i];
    while (e !== undefined) {
        i = i + 1;
        e = v[i];
    }
    return i;
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
        type: "error",
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
            while (i < len && ((c = charcode(string[i])) >= charcode("a") && c <= charcode("z") || (c >= charcode("A") && c <= charcode("Z")) || (c >= charcode("0") && c <= charcode("9")) || c === charcode("_"))) {
                str = str + codechar(c);
                i = i + 1;
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
            while (i < len && (c = charcode(string[i])) >= charcode("0") && c <= charcode("9")) {
                str = str + codechar(c);
                i = i + 1;
            }
            if (c === charcode(".")) {
                str = str + codechar(c);
                i = i + 1;
                while (i < len && (c = charcode(string[i])) >= charcode("0") && c <= charcode("9")) {
                    str = str + codechar(c);
                    i = i + 1;
                }
            }
            if (c === charcode("e") || c === charcode("E")) {
                str = str + codechar(c);
                i = i + 1;
                if (i < len && ((c = charcode(string[i])) === charcode("-") || c === charcode("+"))) {
                    str = str + codechar(c);
                    i = i + 1;
                }
                if (i < len && (c = charcode(string[i])) >= charcode("0") && c <= charcode("9")) {
                    str = str + codechar(c);
                    i = i + 1;
                    c = charcode(string[i]);
                    while (i < len && c >= charcode("0") && c <= charcode("9")) {
                        str = str + codechar(c);
                        i = i + 1;
                        c = charcode(string[i]);
                    }
                }
                else {
                    throw Error("Bad exponent");
                }
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
            while (i < len && (c = charcode(string[i])) !== q) {
                if (c < charcode(" ")) {
                    throw Error("Unterminated/Control character in string");
                }
                if (c === charcode("\\")) {
                    i = i + 1;
                    if (i >= len) {
                        throw Error("Unterminated string");
                    }
                    c = charcode(string[i]);
                    // Handle escape characters here
                }
                str = str + codechar(c);
                i = i + 1;
            }
            i = i + 1; // Skip the closing quote
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
            i = i + 2;
            while (i < len && (c = charcode(string[i])) !== charcode("\n") && c !== charcode("\r")) {
                i = i + 1;
            }
        }
        else if (indexOf(prefix, codechar(c)) >= 0) {
            str = codechar(c);
            i = i + 1;
            while (i < len && indexOf(suffix, codechar((c = charcode(string[i])))) >= 0) {
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
            if (i < len) {
                c = charcode(string[i]);
            }
        }
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
                line: line,
                nud: function (parselet) {
                    let value = parselet.value;
                    if (value.type !== "Symbol") {
                        throw Error("Unreachable");
                    }
                    return { type: "Name", value: value.value, id: "(name)", line: parselet.line };
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
            line: line,
            value: StringLiteral(v),
            nud: function (parselet) {
                let value = parselet.value;
                if (value.type !== "String") {
                    throw Error("Unreachable");
                }
                return {
                    type: "LiteralNode",
                    id: "(literal)",
                    line: parselet.line,
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
            line: line,
            value: NumberLiteral(v),
            nud: function (parselet) {
                let value = parselet.value;
                if (value.type !== "Number") {
                    throw Error("Unreachable");
                }
                return {
                    type: "LiteralNode",
                    id: "(literal)",
                    line: parselet.line,
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
        console.log('===', line);
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
            line: line,
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
            line: parselet.line,
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
                line: parselet.line,
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
                line: parselet.line,
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
            line: parselet.line,
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
                line: parselet.line,
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
        line: parselet.line,
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
        line: parselet.line,
        id: ".",
        left: left,
        right: n.nud(n),
        assignment: false
    };
});
infix("[", 80, function (parselet, left) {
    let n = {
        type: "BinaryNode",
        line: parselet.line,
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
        line: parselet.line,
        id: "(",
        children: []
    };
    let n;
    if ((left.id === "." || left.id === "[") && left.type === "BinaryNode") {
        n = {
            type: "TernaryNode",
            line: parselet.line,
            id: "(",
            first: left.left,
            second: left.right,
            third: a
        };
    }
    else {
        n = {
            type: "BinaryNode",
            line: parselet.line,
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
    // TODO: get rid of the while true?
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
prefix("(", function (parselet) {
    let e = expression(0);
    node = advance(")");
    return e;
});
prefix("function", function (parselet) {
    let n = {
        type: "FunctionNode",
        line: parselet.line,
        id: "function",
        name: "",
        parameters: {
            type: "NodeList",
            line: parselet.line,
            id: "parameters",
            children: []
        },
        body: {
            type: "NodeList",
            line: parselet.line,
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
                line: parselet.line,
                id: "return",
                value: {
                    type: "LiteralNode",
                    line: parselet.line,
                    id: "undefined",
                    value: UNDEFINED
                }
            }];
    }
    n.body.children = children;
    node = advance("}");
    return n;
});
prefix("[", function (parselet) {
    let a = {
        type: "NodeList",
        line: parselet.line,
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
                        line: parselet.line,
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
        line: parselet.line,
        id: "[",
        value: a
    };
});
prefix("{", function (parselet) {
    let a = { type: "NodeList", children: [], id: '{', line: parselet.line };
    if (node.id !== "}") {
        while (true) {
            let n = node;
            let v;
            if (n.id === "...") {
                node = advance('...');
                v = expression(0);
                a.children = [...a.children, {
                        type: "UnaryNode",
                        line: parselet.line,
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
                    line: parselet.line,
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
        line: parselet.line,
        id: "{",
        value: a
    };
});
stmt("{", function (parselet) {
    let n = {
        type: "NodeList",
        line: parselet.line,
        id: "{",
        children: statements()
    };
    node = advance("}");
    return {
        type: "StatementNode",
        line: parselet.line,
        id: "{",
        value: n
    };
});
stmt("throw", function (parselet) {
    let n = {
        type: "StatementNode",
        line: parselet.line,
        id: "throw",
        value: expression(0)
    };
    node = advance(';');
    return n;
});
stmt("let", function (parselet) {
    let n = node.nud(node);
    if (n.type !== "Name") {
        throw Error("Expected a new variable name.");
    }
    node = advance(undefined);
    if (node.id === ";") {
        node = advance(";");
        return {
            type: "BinaryNode",
            line: parselet.line,
            assignment: true,
            id: "let",
            left: n,
            right: {
                type: "LiteralNode",
                line: parselet.line,
                id: "undefined",
                value: UNDEFINED
            }
        };
    }
    node = advance("=");
    let assignment = {
        type: "BinaryNode",
        line: parselet.line,
        assignment: true,
        id: "let",
        left: n,
        right: expression(0)
    };
    node = advance(";");
    return assignment;
});
stmt("if", function (parselet) {
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
            line: parselet.line,
            id: '{',
            value: {
                line: parselet.line,
                type: 'NodeList',
                id: '{',
                children: []
            }
        };
    }
    return {
        type: "TernaryNode",
        line: parselet.line,
        id: "if",
        first: first,
        second: second,
        third: third
    };
});
stmt("try", function (parselet) {
    let first = block();
    node = advance("catch");
    node = advance("(");
    let second = expression(0);
    node = advance(")");
    let third = block();
    return {
        type: "TernaryNode",
        line: parselet.line,
        id: "try",
        first: first,
        second: second,
        third: third
    };
});
stmt("return", function (parselet) {
    let n;
    if (node.id !== ";") {
        n = {
            type: "StatementNode",
            line: parselet.line,
            id: "return",
            value: expression(0)
        };
        node = advance(';');
    }
    else {
        n = {
            type: "StatementNode",
            line: parselet.line,
            id: "return",
            value: {
                type: "LiteralNode",
                line: parselet.line,
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
stmt("break", function (parselet) {
    node = advance(";");
    if (node.id !== "}") {
        throw Error("Unreachable statement.");
    }
    return {
        type: "StatementNode",
        line: parselet.line,
        id: "break",
        value: {
            type: "Name",
            line: parselet.line,
            id: "break",
            value: "break"
        }
    };
});
stmt("continue", function (parselet) {
    node = advance(";");
    if (node.id !== "}") {
        throw Error("Unreachable statement.");
    }
    return {
        type: "StatementNode",
        line: parselet.line,
        id: "continue",
        value: {
            type: "Name",
            line: parselet.line,
            id: "continue",
            value: "continue"
        }
    };
});
stmt("while", function (parselet) {
    node = advance("(");
    let left = expression(0);
    node = advance(")");
    let right = block();
    return {
        type: "StatementNode",
        line: parselet.line,
        id: "while",
        value: {
            type: "BinaryNode",
            line: parselet.line,
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
let NONE = 0;
let CONTINUE = 1;
let BREAK = 2;
let THROW = 3;
let RETURN = 4;
let unwinding = NONE;
let unwindValue = null;
let LiteralStringInterplet = function (v, line) {
    return {
        line: line,
        value: v,
        interpret: function (self) {
            return self.value;
        }
    };
};
let LiteralNumberInterplet = function (v, line) {
    return {
        line: line,
        value: v,
        interpret: function (self) {
            return self.value;
        }
    };
};
let LiteralBooleanInterplet = function (v, line) {
    return {
        line: line,
        value: v,
        interpret: function (self) {
            return self.value;
        }
    };
};
let LiteralNullInterplet = function (line) {
    return {
        line: line,
        interpret: function (self) {
            return null;
        }
    };
};
let LiteralUndefinedInterplet = function (line) {
    return {
        line: line,
        interpret: function (self) {
            return undefined;
        }
    };
};
let LiteralArrayInterplet = function (v, line) {
    return {
        line: line,
        expressions: v,
        interpret: function (self, scope) {
            let result = [];
            let i = 0;
            let l = length(self.expressions);
            while (i < l) {
                let expr = self.expressions[i];
                let value = expr.interpret(expr, scope);
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
let LiteralObjectInterplet = function (keys, values, line) {
    return {
        line: line,
        keys: keys,
        values: values,
        interpret: function (self, scope) {
            let keys = [];
            let values = [];
            let i = 0;
            let l = length(self.keys);
            while (i < l) {
                let key = self.keys[i];
                let value = self.values[i].interpret(self.values[i], scope);
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
let AssignmentInterplet = function (name, value, line) {
    return {
        line: line,
        name: name,
        value: value,
        interpret: function (self, scope) {
            let v = self.value.interpret(self.value, scope);
            let current = scope;
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
let ObjectAssignmentInterplet = function (target, name, value, line) {
    return {
        line: line,
        target: target,
        name: name,
        value: value,
        interpret: function (self, scope) {
            let v = self.value.interpret(self.value, scope);
            let target = self.target.interpret(self.target, scope);
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
let LetInterplet = function (name, value, line) {
    return {
        line: line,
        name: name,
        value: value,
        interpret: function (self, scope) {
            let v = self.value.interpret(self.value, scope);
            let exists = indexOf(scope.locals, self.name);
            if (exists >= 0) {
                throw Error("Cannot redeclare let-scoped variable: " + self.name);
            }
            scope.locals = [...scope.locals, self.name];
            scope.values = [...scope.values, v];
            return v;
        }
    };
};
let NameInterplet = function (name, line) {
    return {
        line: line,
        name: name,
        interpret: function (self, scope) {
            let current = scope;
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
let OperatorInterplet = function (operator, left, right, line) {
    return {
        line: line,
        operator: operator,
        left: left,
        right: right,
        interpret: function (self, scope) {
            let left = self.left.interpret(self.left, scope);
            if (self.operator === "&&" || self.operator === "||") {
                if (typeof left !== "boolean") {
                    throw Error("&& or || values must be boolean");
                }
                if (self.operator === "&&") {
                    if (left === true) {
                        let r = self.right.interpret(self.right, scope);
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
                    let r = self.right.interpret(self.right, scope);
                    if (typeof r !== "boolean") {
                        throw Error("&& or || values must be boolean");
                    }
                    return r;
                }
            }
            let right = self.right.interpret(self.right, scope);
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
let FunctionInterplet = function (parameters, body, line) {
    return {
        line: line,
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
let ReturnInterplet = function (value, line) {
    return {
        line: line,
        value: value,
        interpret: function (self, scope) {
            let ret = self.value.interpret(self.value, scope);
            unwindValue = ret;
            unwinding = RETURN;
            return undefined;
        }
    };
};
let CallInterplet = function (func, args, line) {
    return {
        line: line,
        func: func,
        args: args,
        interpret: function (self, scope) {
            let f = self.func.interpret(self.func, scope);
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
                values = [...values, a.interpret(a, scope)];
                i = i + 1;
            }
            if (f.type === "nativefunction") {
                return f.body(values[0]);
            }
            let stack = {
                locals: locals,
                values: values,
                parent: scope
            };
            i = 0;
            l = length(f.body);
            while (i < l) {
                let s = f.body[i];
                s.interpret(s, stack);
                if (unwinding !== NONE) {
                    if (unwinding === RETURN) {
                        let ret = unwindValue;
                        unwinding = NONE;
                        unwindValue = null;
                        return ret;
                    }
                    else {
                        return undefined;
                    }
                }
                i = i + 1;
            }
            return undefined;
        }
    };
};
let MethodCallInterplet = function (obj, func, args, line) {
    return {
        line: line,
        obj: obj,
        func: func,
        args: args,
        interpret: function (self, scope) {
            let obj = self.obj.interpret(self.obj, scope);
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
                values = [...values, a.interpret(a, scope)];
                i = i + 1;
            }
            let stack = {
                locals: locals,
                values: values,
                parent: scope
            };
            i = 0;
            l = length(f.body);
            while (i < l) {
                let s = f.body[i];
                s.interpret(s, stack);
                if (unwinding !== NONE) {
                    if (unwinding === RETURN) {
                        let ret = unwindValue;
                        unwinding = NONE;
                        unwindValue = null;
                        return ret;
                    }
                    else {
                        return undefined;
                    }
                }
                i = i + 1;
            }
            return undefined;
        }
    };
};
let IndexInterplet = function (target, index, line) {
    return {
        line: line,
        target: target,
        index: index,
        interpret: function (self, scope) {
            let target = self.target.interpret(self.target, scope);
            let index = self.index.interpret(self.index, scope);
            if (target !== null && typeof target === "object") {
                if (target.type === "array" && typeof index === "number") {
                    if (index >= length(target.values)) {
                        return undefined;
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
                    return undefined;
                }
                else {
                    return target[index];
                }
            }
        }
    };
};
let DotInterplet = function (target, key, line) {
    return {
        line: line,
        target: target,
        key: key,
        interpret: function (self, scope) {
            let target = self.target.interpret(self.target, scope);
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
let WhileInterplet = function (condition, block, line) {
    return {
        line: line,
        condition: condition,
        block: block,
        interpret: function (self, scope) {
            let broken = false;
            while (broken === false) {
                let stack = {
                    locals: [],
                    values: [],
                    parent: scope
                };
                let condition = self.condition.interpret(self.condition, scope);
                if (typeof condition !== "boolean") {
                    throw Error("Invalid while condition");
                }
                if (condition === false) {
                    break;
                }
                let i = 0;
                let l = length(self.block);
                while (i < l) {
                    self.block[i].interpret(self.block[i], stack);
                    if (unwinding !== NONE) {
                        if (unwinding === BREAK) {
                            unwinding = NONE;
                            broken = true;
                            i = l;
                        }
                        else if (unwinding === CONTINUE) {
                            unwinding = NONE;
                            i = l;
                        }
                        else {
                            return undefined;
                        }
                    }
                    i = i + 1;
                }
            }
            return undefined;
        }
    };
};
let BreakInterplet = function (line) {
    return {
        line: line,
        interpret: function (self, scope) {
            unwinding = BREAK;
            return undefined;
        }
    };
};
let ContinueInterplet = function (line) {
    return {
        line: line,
        interpret: function (self, scope) {
            unwinding = CONTINUE;
            return undefined;
        }
    };
};
let TryInterplet = function (block, name, handler, line) {
    return {
        line: line,
        block: block,
        name: name,
        handler: handler,
        interpret: function (self, scope) {
            let i = 0;
            let l = 0;
            let block = self.block;
            l = length(block);
            let stack = {
                locals: [],
                values: [],
                parent: scope
            };
            while (i < l) {
                block[i].interpret(block[i], stack);
                if (unwinding !== NONE) {
                    if (unwinding === THROW) {
                        unwinding = NONE;
                        i = l;
                        let stack = scope;
                        let handler = self.handler;
                        let ii = 0;
                        let ll = length(handler);
                        while (ii < ll) {
                            handler[ii].interpret(handler[ii], stack);
                            ii = ii + 1;
                        }
                    }
                    else {
                        return undefined;
                    }
                }
                i = i + 1;
            }
            return undefined;
        }
    };
};
let ThrowInterplet = function (err, line) {
    return {
        line: line,
        err: err,
        interpret: function (self, scope) {
            unwinding = THROW;
            return undefined;
        }
    };
};
let IfInterplet = function (condition, ifTrue, ifFalse, line) {
    return {
        line: line,
        condition: condition,
        ifTrue: ifTrue,
        ifFalse: ifFalse,
        interpret: function (self, scope) {
            let condition = self.condition.interpret(self.condition, scope);
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
                parent: scope
            };
            while (i < l) {
                let n = block[i];
                n.interpret(n, stack);
                if (unwinding !== NONE) {
                    i = l;
                }
                i = i + 1;
            }
            return undefined;
        }
    };
};
let TernaryIfInterplet = function (condition, ifTrue, ifFalse, line) {
    return {
        line: line,
        condition: condition,
        ifTrue: ifTrue,
        ifFalse: ifFalse,
        interpret: function (self, scope) {
            let condition = self.condition.interpret(self.condition, scope);
            if (typeof condition !== "boolean") {
                throw Error("Invalid if condition: must be boolean");
            }
            let expr = self.ifFalse;
            if (condition) {
                expr = self.ifTrue;
            }
            return expr.interpret(expr, scope);
        }
    };
};
let NegativeInterplet = function (value, line) {
    return {
        line: line,
        value: value,
        interpret: function (self, scope) {
            let result = self.value.interpret(self.value, scope);
            if (typeof result !== "number") {
                throw Error("Invalid negative value: must be a number");
            }
            return -result;
        }
    };
};
let TypeofInterplet = function (value, line) {
    return {
        line: line,
        value: value,
        interpret: function (self, scope) {
            let result = self.value.interpret(self.value, scope);
            if (result !== null && typeof result === "object" && result.type === "function") {
                return "function";
            }
            else {
                return typeof result;
            }
        }
    };
};
let SpreadInterplet = function (value, line) {
    return {
        line: line,
        value: value,
        interpret: function (self, scope) {
            let target = self.value.interpret(self.value, scope);
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
            return LiteralBooleanInterplet(value.value, parsed.line);
        }
        else if (value.type === "Null") {
            return LiteralNullInterplet(parsed.line);
        }
        else if (value.type === "Number") {
            return LiteralNumberInterplet(value.value, parsed.line);
        }
        else if (value.type === "String") {
            return LiteralStringInterplet(value.value, parsed.line);
        }
        else if (value.type === "Undefined") {
            return LiteralUndefinedInterplet(parsed.line);
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
                return ObjectAssignmentInterplet(createInterp(target), name.value, createInterp(right), parsed.line);
            }
            return AssignmentInterplet(left.value, createInterp(right), parsed.line);
        }
        else if (parsed.id === "let" && parsed.assignment) {
            let left = parsed.left;
            let right = createInterp(parsed.right);
            if (left.type !== "Name") {
                throw Error("Invalid assignment name");
            }
            return LetInterplet(left.value, right, parsed.line);
        }
        else if (indexOf(operators, parsed.id) > -1) {
            let left = createInterp(parsed.left);
            let right = createInterp(parsed.right);
            return OperatorInterplet(parsed.id, left, right, parsed.line);
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
            return CallInterplet(left, args, parsed.line);
        }
        else if (parsed.id === '[') {
            let left = createInterp(parsed.left);
            let right = createInterp(parsed.right);
            return IndexInterplet(left, right, parsed.line);
        }
        else if (parsed.id === ".") {
            let left = createInterp(parsed.left);
            let right = parsed.right;
            if (right.type !== "Name") {
                throw Error("Invalid dot access");
            }
            return DotInterplet(left, right.value, parsed.line);
        }
    }
    else if (parsed.type === "Name") {
        return NameInterplet(parsed.value, parsed.line);
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
            return LiteralObjectInterplet(keys, values, parsed.line);
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
            return LiteralArrayInterplet(values, parsed.line);
        }
        else if (parsed.id === "-") {
            let value = createInterp(parsed.value);
            return NegativeInterplet(value, parsed.line);
        }
        else if (parsed.id === "typeof") {
            let value = createInterp(parsed.value);
            return TypeofInterplet(value, parsed.line);
        }
        else if (parsed.id === "...") {
            let value = createInterp(parsed.value);
            return SpreadInterplet(value, parsed.line);
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
        return FunctionInterplet(parameters, body, parsed.line);
    }
    else if (parsed.type === "StatementNode") {
        if (parsed.id === "return") {
            return ReturnInterplet(createInterp(parsed.value), parsed.line);
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
            return WhileInterplet(left, block, parsed.line);
        }
        else if (parsed.id === "break") {
            return BreakInterplet(parsed.line);
        }
        else if (parsed.id === "continue") {
            return ContinueInterplet(parsed.line);
        }
        else if (parsed.id === "throw") {
            let err = createInterp(parsed.value);
            return ThrowInterplet(err, parsed.line);
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
            return TryInterplet(block, second.value, guard, parsed.line);
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
                return IfInterplet(expr, trueBlock, [createInterp(ifFalse)], parsed.line);
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
            return IfInterplet(expr, trueBlock, falseBlock, parsed.line);
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
            return MethodCallInterplet(first, second.value, args, parsed.line);
        }
        else if (parsed.id === "?") {
            let condition = createInterp(parsed.first);
            let ifTrue = createInterp(parsed.second);
            let ifFalse = createInterp(parsed.third);
            return TernaryIfInterplet(condition, ifTrue, ifFalse, parsed.line);
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
    let scope = {
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
        interp.interpret(interp, scope);
        i = i + 1;
    }
    if (native) {
        log('starting');
        let meta = scope.values[indexOf(scope.locals, 'main')];
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
            parent: scope
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
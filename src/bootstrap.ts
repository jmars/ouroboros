import { Frame, createInterp, NativeFunction } from './astinterp.js';
import { tokenize } from './lexer.js';
import { parse } from './parser.js';
import { indexOf, length } from './util.js';

export let main = function(readFileSync, log, native) {
  let source = readFileSync('./out.js', 'utf-8');
  let prefix = ['=', '<', '>', '!', '+', '-', '*', '&', '|', '/', '%', '^', '.'];
  let suffix = ['=', '<', '>', '&', '|', '.', '*'];

  log('tokenizing');
  let tokens = tokenize(source, prefix, suffix, log);
  log('parsing');
  let tree = parse(tokens);

  let frame: Frame = {
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
    log('starting')
    let meta = frame.values[indexOf(frame.locals, 'main')];
    
    if (typeof meta !== "object" || meta.type !== "function") {
      log("Invalid main function");
      return;
    }

    let ilog: NativeFunction = {
      type: "nativefunction",
      body: function(arg) {
        log("|: " + arg);
      },
      parameters: ['string']
    }

    let iread: NativeFunction = {
      type: "nativefunction",
      body: function(path) {
        return readFileSync(path, 'utf-8');
      },
      parameters: ['path']
    }

    let ilength: NativeFunction = {
      type: "nativefunction",
      body: function(a) {
        if (typeof a === "string") {
          return a.length;
        }
        return a.values.length;
      },
      parameters: ['a']
    }

    let stack: Frame = {
      locals: ['readFileSync', 'log', 'native', 'jetLength'],
      values: [iread, ilog, false, ilength],
      parent: frame
    }

    i = 0;
    l = length(meta.body);
    while (i < l) {
      let s = meta.body[i];
      try {
        s.interpret(s, stack);
      } catch (err) {
        log(JSON.stringify(err, null, 2));
        return;
      }
      
      i = i + 1;
    }
  }
}
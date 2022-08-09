import { Frame, createInterp, NativeFunction } from './astinterp';
import { tokenize } from './lexer';
import { parse } from './parser';
import { indexOf, length } from './util';

export let main = function(readFileSync, log, native) {
  let source = readFileSync('./out.js', 'utf-8');
  let prefix = ['=', '<', '>', '!', '+', '-', '*', '&', '|', '/', '%', '^', '.'];
  let suffix = ['=', '<', '>', '&', '|', '.', '*'];

  let tokens = tokenize(source, prefix, suffix);
  let tree = parse(tokens);

  let frame: Frame = {
    locals: ['Infinity'],
    values: [Infinity],
    ret: undefined,
    globals: null,
    finished: false
  };

  let i = 0;
  let l = length(tree);
  while (i < l) {
    let node = tree[i];
    let interp = createInterp(node);
    interp.interpret(interp, frame);
    i = i + 1;
  }

  if (native) {
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

    let stack: Frame = {
      locals: ['readFileSync', 'log', 'native'],
      values: [iread, ilog, false],
      ret: undefined,
      globals: frame,
      finished: false
    }

    i = 0;
    l = length(meta.body);
    while (i < l) {
      let s = meta.body[i];
      s.interpret(s, stack);

      if (stack.finished) {
        log("finished");
        break;
      }
      
      i = i + 1;
    }
  }
}
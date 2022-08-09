import { Frame, createInterp } from './astinterp';
import tokenize from './lexer';
import parse from './parser';

const source = (await Bun.file('./out.js').text()).replaceAll('export {};', '').replaceAll('\n;', '');

try {
  const tokens = tokenize(source, "=<>!+-*&|/%^.".split(''), "=<>&|.*".split(''));
  const tree = parse(tokens);
  const treeJSON = JSON.stringify(tree, null, 2);
  Bun.write(Bun.file("./ast.json"), treeJSON);

  let frame: Frame = { locals: [], values: [], ret: undefined, globals: null, finished: false };

  for (const node of tree) {
    const interp = createInterp(node);
    interp.interpret(interp, frame);
  }

  console.log(frame);
} catch (e) {
  if (typeof e === "string") {
    throw new Error(e);
  }
  throw e;
}
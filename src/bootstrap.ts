import { createAst } from './astinterp';
import tokenize from './lexer';
import parse from './parser';

// let source = await Bun.file('./src/lexer.js').text();
// source += await Bun.file('./src/parser.js').text();
// source = source.replaceAll(/export default ([^;]+);/gi, '');
let source = await Bun.file('./test.js').text();

try {
  const tokens = tokenize(source, "=<>!+-*&|/%^.".split(''), "=<>&|.*".split(''));
  const tree = parse(tokens);
  const treeJSON = JSON.stringify(tree, null, 2);
  Bun.write(Bun.file("./ast.json"), treeJSON);
  const interp = createAst(tree[0]);
  console.log(interp.interpret(interp, {}, null));
} catch (e) {
  if (typeof e === "string") {
    throw new Error(e);
  }
  throw e;
}
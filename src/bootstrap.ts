import { Context, createAst } from './astinterp';
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

  let context: Context = { globals: {} };

  for (const node of tree) {
    const interp = createAst(node);
    interp.interpret(interp, context, null);
  }

  console.log(context);
} catch (e) {
  if (typeof e === "string") {
    throw new Error(e);
  }
  throw e;
}
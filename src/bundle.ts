const Utils = await Bun.file("./src/util.ts").text();
const Lexer = await Bun.file("./src/lexer.ts").text();
const Parser = await Bun.file("./src/parser.ts").text();
const Interpreter = await Bun.file("./src/astinterp.ts").text();
let source = Utils + "\n" + Lexer + "\n" + Parser + "\n" + Interpreter;
source = source.replaceAll(/export default ([^;]+);/gi, '');
source = source.replaceAll(/export let/gi, 'let');
source = source.replaceAll(/import ([^;]+);/gi, '');
await Bun.write(Bun.file("./out.ts"), source);

export default {};
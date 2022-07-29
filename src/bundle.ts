const Utils = await Bun.file("./src/util.ts").text();
const Lexer = await Bun.file("./src/lexer.ts").text();
let source = Utils + "\n" + Lexer;
source = source.replaceAll(/export default ([^;]+);/gi, '');
source = source.replaceAll(/export let/gi, 'let');
source = source.replaceAll(/import ([^;]+);/gi, '');
await Bun.write(Bun.file("./out.ts"), source);

export default {};
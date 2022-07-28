# MetaJS

A metacircular evaluator for a subset of javascript connected to a runtime extensible top down operator precedence parser.

## Purpose
To bootstrap a full ecmascript3 interpreter from the smallest possible base language.

## Restricted Javascript

The subset used to bootstrap the parser and interpreter is as minimal as possible and aimed at being easy to compile statically or optimise in a just in time compiler.

* No Prototypes
* Arrays have a static length
* Objects have static keys (set at creation time)
* No Coercion, operators that use it are missing or fail with incorrect left/right types
* No `for` loops, only `while` loops
* Limited set of arithmetic operators (no `++`, `--` prefix or postfix)
* No closures, global scope and local variables only
* Only `let` is available for variable creation
* No dangling commas
* Semicolons are mandatory
* No new keyword or classes
* no `this` keyword or automated object method scoping
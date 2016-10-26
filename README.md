# babel-plugin-swift-blocks

Experiment at extending Babel syntax.

Enables more swift-like syntax in JavaScript: you can omit the parens for the condition in all if, for*, while, do-while statements so long as you use braces.

See [paren-free](https://brendaneich.com/2010/11/paren-free/).

Also see [blog post](https://medium.com/@jacobp100/adding-custom-syntax-to-babel-e1a1315c6a90).

## Valid

```js
if condition {
  doSomething();
} else if otherCondition {
  doSomethingElse();
} else {
  doAThirdThing();
}

for const i in object {
  doSomething(i);
}

for const i of iterable {
  doSomething(i);
}

do {
  doSomething(i);
} while condition;
```

## Invalid

```js
if condition
  doSomething();

for const i in object
  doSomething(i);

for const i of iterable
  doSomething(i);

do
  doSomething(i);
while condition;
```

Swift doesn't have imperative for-loops, so these are also invalid.

```js
// invalid
for let i = 0; condition; i += 1 {
  doSomething(i);
}
```

Note that for if conditions, your paren style must be consistent.

```js
// Invalid
if condition {
  doSomething();
} else
  doSomethingElse();

if condition {
  doSomething();
} else if otherCondition {
  doSomethingElse();
} else
  doAThirdThing();
```

People who like language grammars might notice this is being cheeky, since when you write `else if`, the `if` statement is actually its own statement without braces. Subsequent `if`s, and nothing else, are allowed to use implicit braces after an `else`.

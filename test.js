/* eslint-disable import/no-extraneous-dependencies */
const { join } = require('path');
const { default: test } = require('ava');
const { transform } = require('babel-core');

const babelOptions = {
  plugins: [join(__dirname, 'index.js')],
};

const trimWhitespace = text => text
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0)
  .join('\n');

const transformResult = (t, input, expected) => {
  t.plan(1);

  const actual = transform(input, babelOptions).code;

  t.is(
    trimWhitespace(actual),
    trimWhitespace(expected)
  );
};

const noResult = (t, input) => {
  t.plan(1);

  t.throws(() => transform(input, babelOptions));
};

test('simple if', transformResult, `
  if condition {
    result;
  }
`, `
  if (condition) {
    result;
  }
`);

test('if-else', transformResult, `
  if condition {
    result;
  } else {
    otherResult;
  }
`, `
  if (condition) {
    result;
  } else {
    otherResult;
  }
`);

test('if-else-if', transformResult, `
  if condition {
    result;
  } else if otherCondition {
    otherResult;
  }
`, `
  if (condition) {
    result;
  } else if (otherCondition) {
    otherResult;
  }
`);

test('if-else-if-else', transformResult, `
  if condition {
    result;
  } else if otherCondition {
    otherResult;
  } else {
    otherOtherResult;
  }
`, `
  if (condition) {
    result;
  } else if (otherCondition) {
    otherResult;
  } else {
    otherOtherResult;
  }
`);

test('must have braces for simple if', noResult, `
  if condition
    result;
`);

test('must have braces for if-else', noResult, `
  if condition
    result;
  else {
    result;
  }
`);

// Technically there is no ambiguity here. It's just ugly.
test('must have braces for if-else', noResult, `
  if condition {
    result;
  } else
    result;
`);

test('must have braces for if-else-if', noResult, `
  if condition {
    result;
  } else if otherCondition
    result;
`);

test('must have braces for if-else-if', noResult, `
  if condition
    result;
  else if otherCondition {
    result;
  }
`);

test('must have braces for if-else-if-else', noResult, `
  if condition {
    result;
  } else if otherCondition {
    result;
  } else
    otherOtherResult;
`);

test('must have braces for if-else-if-else', noResult, `
  if condition {
    result;
  } else if otherCondition
    result;
  else {
    otherOtherResult;
  }
`);

test('must have braces for if-else-if-else', noResult, `
  if condition
    result;
  else if otherCondition {
    result;
  } else {
    otherOtherResult;
  }
`);

test('for-in loop', transformResult, `
  for const i in { a: 1, b: 2 } {
    console.log(i);
  }
`, `
  for (const i in { a: 1, b: 2 }) {
    console.log(i);
  }
`);

test('for-of loop', transformResult, `
  for const i of [1, 2, 3] {
    console.log(i);
  }
`, `
  for (const i of [1, 2, 3]) {
    console.log(i);
  }
`);

test('cannot transform imperative for loops', noResult, `
  for let i = 0; i < 10; i += 1 {
    console.log(i);
  }
`);

test('must have braces for for-in loop', noResult, `
  for const i in { a: 1, b: 2 }
    console.log(i);
`);

test('must have braces for for-of loop', noResult, `
  for const i of [1, 2, 3]
    console.log(i);
`);

test('while loop', transformResult, `
  while condition {
    console.log('condition met');
  }
`, `
  while (condition) {
    console.log('condition met');
  }
`);

test('must have braces for while loop', noResult, `
  while condition
    console.log('condition met');
`);

test('do-while loop', transformResult, `
  do {
    console.log('condition met');
  } while condition;
`, `
  do {
    console.log('condition met');
  } while (condition);
`);

// Valid JS syntax. Go figure.
test('allows omission of braces in do-while loop when using parens', transformResult, `
  do
    console.log('condition met');
  while (condition);
`, `
  do console.log('condition met'); while (condition);
`);

test('must have braces do-while loop', noResult, `
  do
    console.log('condition met');
  while condition;
`);

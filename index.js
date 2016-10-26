/* eslint-disable no-param-reassign, no-underscore-dangle */
const { plugins } = require('babylon/lib/parser');
const { types: tt } = require('babylon/lib/tokenizer/types');

const pluginName = 'swift-blocks';

const varTypes = [tt._var, tt._let, tt._const];
const loopLabel = { kind: 'loop' };


const plugin = (instance) => {
  instance.extend('parseParenFreeIfStatement', () => function parseParenFreeIfStatement(node) {
    this.next();
    node.test = this.parseExpression();
    const allowDirectives = false;
    node.consequent = this.parseBlock(allowDirectives);
    node.alternate = this.eat(tt._else) ? this.parseParenFreeElseStatement() : null;
    return this.finishNode(node, 'IfStatement');
  });

  instance.extend('parseParenFreeElseStatement', () => function parseParenFreeElseStatement() {
    const node = this.startNode();

    return (this.match(tt._if))
      ? this.parseParenFreeIfStatement(node)
      : this.parseBlock(false);
  });

  instance.extend('parseIfStatement', inner => function parseIfStatement(node) {
    return (this.lookahead().type === tt.parenL)
      ? inner.call(this, node)
      : this.parseParenFreeIfStatement(node);
  });

  instance.extend('parseForStatement', inner => function parseForStatement(node) {
    if (!varTypes.includes(this.lookahead().type)) return inner.call(this, node);

    this.next();

    const init = this.startNode();
    const varKind = this.state.type;
    this.next();
    this.parseVar(init, true, varKind);
    this.finishNode(init, 'VariableDeclaration');

    const type = this.match(tt._in) ? 'ForInStatement' : 'ForOfStatement';
    this.next();

    node.left = init;
    this.state.labels.push(loopLabel);
    node.right = this.parseExpression();
    this.state.labels.push(loopLabel);
    node.body = this.parseBlock(false);

    return this.finishNode(node, type);
  });

  instance.extend('parseWhileStatement', inner => function parseWhileStatement(node) {
    if (this.lookahead().type === tt.parenL) inner.call(this, node);

    this.next();
    this.state.labels.push(loopLabel);
    node.test = this.parseExpression();
    this.state.labels.push(loopLabel);
    node.body = this.parseBlock(false);

    return this.finishNode(node, 'WhileStatement');
  });

  instance.extend('parseDoStatement', () => function parseDoStatement(node) {
    this.next();

    const isBlock = this.state.type === tt.braceL;

    this.state.labels.push(loopLabel);
    node.body = this.parseStatement(false);
    this.state.labels.pop();
    this.expect(tt._while);
    node.test = isBlock ? this.parseExpression() : this.parseParenExpression();
    this.eat(tt.semi);

    return this.finishNode(node, 'DoWhileStatement');
  });
};

plugins[pluginName] = plugin;

module.exports = () => ({
  manipulateOptions(opts, parserOpts) {
    parserOpts.plugins.push(pluginName);
  },
});

;(function () {
  'use strict'

  /* imports */
  const { compose, apply } = require('fun-function')
  const { equal, equalDeep } = require('fun-predicate')
  const object = require('fun-object')
  const funTest = require('fun-test')
  const arrange = require('fun-arrange')
  const sample = require('fun-sample')
  const { ap, map } = require('fun-array')
  const type = require('fun-type')

  const pairBool = ps => ap([sample.boolean, sample.boolean], ps)

  const boolToP = bool => bool ? 0.5 : 0

  const inputToOutput = (p, inP) =>
    (outP => outP >= 1 ? outP - 1 : outP)(p + inP)

  const funTests = [
    {
      inputs: [boolToP, sample.boolean, inputToOutput, 0.5],
      predicate: compose(
        equal(false),
        apply([true])
      ),
      contra: object.get('fn')
    },
    {
      inputs: [boolToP, sample.boolean, inputToOutput, 0.5],
      predicate: compose(
        equal(true),
        apply([false])
      ),
      contra: object.get('fn')
    },
    {
      inputs: [boolToP, sample.boolean, inputToOutput, 0],
      predicate: compose(
        equal(false),
        apply([false])
      ),
      contra: object.get('fn')
    },
    {
      inputs: [boolToP, sample.boolean, inputToOutput, 0],
      predicate: type.fun,
      contra: object.get('fn')
    }
  ]

  const tests = map(
    compose(
      object.ap({ predicate: equalDeep, contra: object.get}),
      arrange({ inputs: 0, predicate: 1, contra: 2 })
    ), [
      [
        [pairBool, { a: [0.499, 0.5], b: [0, 0.25], c: [0.99, 0.01] }],
        { a: [false, true], b: [false, false], c: [true, false] },
        'objectOf'
      ],
      [
        [sample.boolean, { a: 0.499, b: 0.5, c: 0 }],
        { a: false, b: true, c: false },
        'objectOf'
      ],
      [
        [{ a: pairBool, b: sample.boolean }, { a: [0.449, 0.5], b: 0.5 }],
        { a: [false, true], b: true },
        'record'
      ],
      [
        [{ a: sample.boolean, b: sample.boolean }, { a: 0.499, b: 0.5 }],
        { a: false, b: true },
        'record'
      ],
      [
        [sample.boolean, [0.499, 0.5, 0]],
        [false, true, false],
        'arrayOf'
      ],
      [
        [[pairBool, sample.boolean], [[0.499, 0.5], 0.5]],
        [[false, true], true],
        'tuple'
      ],
      [
        [[sample.boolean, sample.boolean], [0.499, 0.5]],
        [false, true],
        'tuple'
      ],
      [['def', [0.6, 0, 0.67, 0.3]], 'edfd', 'string'],
      [['abc', [0.6, 0.67, 0.3]], 'bca', 'string'],
      [['abc', 0.667], 'c', 'character'],
      [['abc', 0.666], 'b', 'character'],
      [['abc', 0.333], 'a', 'character'],
      [[0.5], true, 'boolean'],
      [[0.49], false, 'boolean'],
      [[['a', 'b', 'c'], 0.333], 'a', 'member'],
      [[['a', 'b', 'c'], 0.334], 'b', 'member'],
      [[['a', 'b', 'c'], 0.667], 'c', 'member'],
      [[0, 10, 0.51], 5, 'integer'],
      [[0, 10, 0.51], 5.1, 'number']
    ])

  /* exports */
  module.exports = funTests.concat(tests).map(x => funTest.sync(x))
})()


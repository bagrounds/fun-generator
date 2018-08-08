;(function () {
  'use strict'

  /* imports */
  var fn = require('fun-function')
  var predicate = require('fun-predicate')
  var object = require('fun-object')
  var funTest = require('fun-test')
  var arrange = require('fun-arrange')
  var sample = require('fun-sample')
  var array = require('fun-array')
  var type = require('fun-type')

  function pairBool (ps) {
    return array.ap([sample.boolean, sample.boolean], ps)
  }

  function boolToP (bool) {
    return bool ? 0.5 : 0
  }

  function inputToOutput (p, inP) {
    var outP = p + inP
    return outP >= 1 ? outP - 1 : outP
  }

  var funTests = [
    {
      inputs: [boolToP, sample.boolean, inputToOutput, 0.5],
      predicate: fn.compose(
        predicate.equal(false),
        fn.apply([true])
      ),
      contra: object.get('fn')
    },
    {
      inputs: [boolToP, sample.boolean, inputToOutput, 0.5],
      predicate: fn.compose(
        predicate.equal(true),
        fn.apply([false])
      ),
      contra: object.get('fn')
    },
    {
      inputs: [boolToP, sample.boolean, inputToOutput, 0],
      predicate: fn.compose(
        predicate.equal(false),
        fn.apply([false])
      ),
      contra: object.get('fn')
    },
    {
      inputs: [boolToP, sample.boolean, inputToOutput, 0],
      predicate: type.fun,
      contra: object.get('fn')
    }
  ]

  var tests = [
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
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(o => object.ap({
      predicate: predicate.equalDeep,
      contra: object.get
    }, o))

  /* exports */
  module.exports = funTests.concat(tests).map(x => {
    console.log(x)
    return funTest.sync(x)
  })
})()


/**
 *
 * @module fun-generator
 */
;(function () {
  'use strict'

  /* imports */
  var fun = require('fun-function')
  var object = require('fun-object')
  var guarded = require('guarded')
  var type = require('fun-type')
  var predicate = require('fun-predicate')
  var scalar = require('fun-scalar')
  var sample = require('fun-sample')
  var array = require('fun-array')

  var api = {
    fn: fn,
    objectOf: objectOf,
    record: record,
    arrayOf: arrayOf,
    tuple: tuple,
    boolean: boolean,
    string: string,
    character: character,
    integer: integer,
    number: number,
    member: member
  }

  var isBetween0And1 = predicate.and(scalar.gte(0), scalar.lt(1))
  var isProbability = predicate.and(type.num, isBetween0And1)
  var isCharacter = predicate.and(
    type.string,
    fun.compose(predicate.equal(1), s => s.length)
  )

  var fstSndLengthEqual = fun.compose(
    fun.argsToArray(predicate.equal),
    array.map(array.length)
  )

  var fstSndObjLengthEqual = fun.compose(
    fun.argsToArray(predicate.equal),
    array.map(fun.compose(array.length, object.values))
  )

  var guards = object.map(
    ([i, o]) => fun.compose(guarded.inputs(i), guarded.output(o)), {
      fn: [
        type.tuple([
          type.fun,
          type.fun,
          type.fun,
          isProbability
        ]),
        type.fun
      ],
      objectOf: [
        type.tuple([type.fun, type.object]),
        type.object
      ],
      record: [
        predicate.and(
          type.tuple([type.object, type.object]),
          fstSndObjLengthEqual
        ),
        type.object
      ],
      arrayOf: [
        type.tuple([type.fun, type.array]),
        type.array
      ],
      tuple: [
        predicate.and(
          type.tuple([type.array, type.array]),
          fstSndLengthEqual
        ),
        type.array
      ],
      string: [
        type.tuple([type.string, type.arrayOf(isProbability)]),
        type.string
      ],
      character: [
        type.tuple([type.string, isProbability]),
        isCharacter
      ],
      boolean: [type.tuple([isProbability]), type.bool],
      integer: [
        type.tuple([type.num, type.num, isProbability]),
        type.num
      ],
      number: [
        type.tuple([type.num, type.num, isProbability]),
        type.num
      ],
      member: [
        type.tuple([type.array, isProbability]),
        type.any
      ]
    })

  /* exports */
  module.exports = object.map(fun.curry, object.ap(guards, api))

  /**
   *
   * @function module:fun-generator.fn
   *
   * @param {Function} inputToP - a -> p
   * @param {Function} outputGen - p -> b
   * @param {Function} p2p - p -> p
   * @param {Number} p - number on interval [0, 1)
   *
   * @return {Function} a -> b
   */ // eslint-disable-next-line max-params
  function fn (inputToP, outputGen, p2p, p) {
    return fun.composeAll([
      outputGen,
      p2p.bind(null, p),
      inputToP
    ])
  }

  /**
   *
   * @function module:fun-generator.objectOf
   *
   * @param {Function} generator - p -> a
   * @param {Object} ps - numbers on interval [0, 1)
   *
   * @return {Object} { a }
   */
  function objectOf (generator, ps) {
    return object.map(generator, ps)
  }

  /**
   *
   * @function module:fun-generator.record
   *
   * @param {Object} generators - for each member of record
   * @param {Object} ps - numbers on interval [0, 1)
   *
   * @return {Object} record
   */
  function record (generators, ps) {
    return object.ap(generators, ps)
  }

  /**
   *
   * @function module:fun-generator.arrayOf
   *
   * @param {Function} generator - p -> a
   * @param {Array<Number>} ps - numbers on interval [0, 1)
   *
   * @return {Array} [a]
   */
  function arrayOf (generator, ps) {
    return array.map(generator, ps)
  }

  /**
   *
   * @function module:fun-generator.tuple
   *
   * @param {Array<Function>} generators - for each member of tuple
   * @param {Array<Number>} ps - numbers on interval [0, 1)
   *
   * @return {Array} tuple
   */
  function tuple (generators, ps) {
    return array.ap(generators, ps)
  }

  /**
   *
   * @function module:fun-generator.string
   *
   * @param {String} alphabet - string of characters to choose from
   * @param {Array<Number>} ps - numbers on interval [0, 1)
   *
   * @return {String} of length length(ps)
   */
  function string (alphabet, ps) {
    return arrayOf(fun.curry(character)(alphabet), ps).join('')
  }

  /**
   *
   * @function module:fun-generator.character
   *
   * @param {String} string - to get character from
   * @param {Number} p - number on interval [0, 1)
   *
   * @return {String} of length 1
   */
  function character (string, p) {
    return sample.member(string.split(''), p)
  }

  /**
   *
   * @function module:fun-generator.boolean
   *
   * @param {Number} p - number on interval [0, 1)
   *
   * @return {Boolean} true or false
   */
  function boolean (p) {
    return sample.member([false, true], p)
  }

  /**
   *
   * @function module:fun-generator.integer
   *
   * @param {Number} min - lower bound
   * @param {Number} max - upper bound
   * @param {Number} p - number on interval [0, 1)
   *
   * @return {Number} integer on interval [min, max]
   */
  function integer (min, max, p) {
    return sample.integer(min, max, p)
  }

  /**
   *
   * @function module:fun-generator.member
   *
   * @param {Array} set - to pick from
   * @param {Number} p - number on interval [0, 1)
   *
   * @return {*} an element of set
   */
  function member (set, p) {
    return sample.member(set, p)
  }

  /**
   *
   * @function module:fun-generator.number
   *
   * @param {Number} min - lower bound
   * @param {Number} max - upper bound
   * @param {Number} p - number on interval [0, 1)
   *
   * @return {Number} number on interval [min, max)
   */
  function number (min, max, p) {
    return sample.number(min, max, p)
  }
})()


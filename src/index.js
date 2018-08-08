/**
 *
 * @module fun-generator
 */
;(function () {
  'use strict'

  /* imports */
  const { compose, composeAll, argsToArray, curry } = require('fun-function')
  const object = require('fun-object')
  const { inputs, output } = require('guarded')
  const type = require('fun-type')
  const { and, equal } = require('fun-predicate')
  const { gte, lt } = require('fun-scalar')
  const sample = require('fun-sample')
  const { map, ap, length } = require('fun-array')

  const isBetween0And1 = and(gte(0), lt(1))
  const isProbability = and(type.num, isBetween0And1)
  const isCharacter = and(
    type.string,
    compose(equal(1), s => s.length)
  )

  const fstSndLengthEqual = compose(
    argsToArray(equal),
    map(length)
  )

  const fstSndObjLengthEqual = compose(
    argsToArray(equal),
    map(compose(length, object.values))
  )

  const guards = object.map(
    ([i, o]) => compose(inputs(i), output(o)), {
      fn: [
        type.tuple([type.fun, type.fun, type.fun, isProbability]),
        type.fun
      ],
      objectOf: [type.tuple([type.fun, type.object]), type.object],
      record: [
        and(
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
        and(
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
  const fn = (inputToP, outputGen, p2p, p) => composeAll([
    outputGen,
    p2p.bind(null, p),
    inputToP
  ])

  /**
   *
   * @function module:fun-generator.objectOf
   *
   * @param {Function} generator - p -> a
   * @param {Object} ps - numbers on interval [0, 1)
   *
   * @return {Object} { a }
   */
  const objectOf = (generator, ps) => object.map(generator, ps)

  /**
   *
   * @function module:fun-generator.record
   *
   * @param {Object} generators - for each member of record
   * @param {Object} ps - numbers on interval [0, 1)
   *
   * @return {Object} record
   */
  const record = (generators, ps) => object.ap(generators, ps)

  /**
   *
   * @function module:fun-generator.arrayOf
   *
   * @param {Function} generator - p -> a
   * @param {Array<Number>} ps - numbers on interval [0, 1)
   *
   * @return {Array} [a]
   */
  const arrayOf = (generator, ps) => map(generator, ps)

  /**
   *
   * @function module:fun-generator.tuple
   *
   * @param {Array<Function>} generators - for each member of tuple
   * @param {Array<Number>} ps - numbers on interval [0, 1)
   *
   * @return {Array} tuple
   */
  const tuple = (generators, ps) => ap(generators, ps)

  /**
   *
   * @function module:fun-generator.string
   *
   * @param {String} alphabet - string of characters to choose from
   * @param {Array<Number>} ps - numbers on interval [0, 1)
   *
   * @return {String} of length length(ps)
   */
  const string = (alphabet, ps) =>
    arrayOf(curry(character)(alphabet), ps).join('')

  /**
   *
   * @function module:fun-generator.character
   *
   * @param {String} string - to get character from
   * @param {Number} p - number on interval [0, 1)
   *
   * @return {String} of length 1
   */
  const character = (string, p) => sample.member(string.split(''), p)

  /**
   *
   * @function module:fun-generator.boolean
   *
   * @param {Number} p - number on interval [0, 1)
   *
   * @return {Boolean} true or false
   */
  const boolean = (p) => sample.member([false, true], p)

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
  const integer = (min, max, p) => sample.integer(min, max, p)

  /**
   *
   * @function module:fun-generator.member
   *
   * @param {Array} set - to pick from
   * @param {Number} p - number on interval [0, 1)
   *
   * @return {*} an element of set
   */
  const member = (set, p) => sample.member(set, p)

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
  const number = (min, max, p) => sample.number(min, max, p)

  const api = {
    fn,
    objectOf,
    record,
    arrayOf,
    tuple,
    boolean,
    string,
    character,
    integer,
    number,
    member
  }

  /* exports */
  module.exports = object.map(curry, object.ap(guards, api))
})()


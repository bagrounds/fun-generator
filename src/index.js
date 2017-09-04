/**
 *
 * @module fun-generator
 */
;(function () {
  'use strict'

  /* imports */
  var fn = require('fun-function')
  var object = require('fun-object')
  var guarded = require('guarded')
  var type = require('fun-type')
  var predicate = require('fun-predicate')
  var scalar = require('fun-scalar')
  var sample = require('fun-sample')
  var array = require('fun-array')

  var api = {
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
  var isProbability = predicate.and(type.isNumber, isBetween0And1)
  var isCharacter = predicate.and(
    type.isString,
    fn.compose(predicate.equal(1), array.length)
  )

  var fstSndLengthEqual = fn.compose(
    fn.argsToArray(predicate.equal),
    array.map(array.length)
  )

  var fstSndObjLengthEqual = fn.compose(
    fn.argsToArray(predicate.equal),
    array.map(fn.compose(array.length, object.values))
  )

  var guards = {
    objectOf: guarded(
      type.isTuple([type.isFunction, type.isObject]),
      type.isObject
    ),
    record: guarded(
      predicate.and(
        type.isTuple([type.isObject, type.isObject]),
        fstSndObjLengthEqual
      ),
      type.isObject
    ),
    arrayOf: guarded(
      type.isTuple([type.isFunction, type.isArray]),
      type.isArray
    ),
    tuple: guarded(
      predicate.and(
        type.isTuple([type.isArray, type.isArray]),
        fstSndLengthEqual
      ),
      type.isArray
    ),
    string: guarded(
      type.isTuple([type.isString, type.isArrayOf(isProbability)]),
      type.isString
    ),
    character: guarded(
      type.isTuple([type.isString, isProbability]),
      isCharacter
    ),
    boolean: guarded(type.isTuple([isProbability]), type.isBoolean),
    integer: guarded(
      type.isTuple([type.isNumber, type.isNumber, isProbability]),
      type.isNumber
    ),
    number: guarded(
      type.isTuple([type.isNumber, type.isNumber, isProbability]),
      type.isNumber
    ),
    member: guarded(
      type.isTuple([type.isArray, isProbability]),
      type.any
    )
  }

  /* exports */
  module.exports = object.map(fn.curry, object.ap(guards, api))

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
    return arrayOf(fn.curry(character)(alphabet), ps).join('')
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


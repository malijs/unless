const conditionTest = require('mali-condition-test')

/**
 * Mali unless middleware. Attach to any middleware and configure it to prevent/permit the
 * middleware in question to be executed.
 * @module mali-unless
 *
 * @param {Object|String|RegExp|Function} options
 *        - If <code>string</code> and one of <code>Mali Call Types</code> do middleware
 *        unless it is the specified call type
 *        - If <code>string</code> and not a call type, assumed to be a call name, and
 *        middleware is executed unless the call name is the name specified. Call names checks are not case sensitive.
 *        - If <code>function</code> it's a test function that returns <code>true</code> / <code>false</code>.
 *        If the function returns <code>true</code> for the given request, the middleware will not run.
 *        The function will be passed the call context.
 *        - If <code>RegExp</code> instance, if call name matches the regexp the middleware is skipped.
 * @param {String|Regex|Array} options.name A <code>string</code>, a <code>RegExp</code> or an array of any of those.
 *                                          If the call name matches, the middleware will not run.
 *                                          Call names checks are not case sensitive.
 * @param {String|Array} options.type A <code>string</code> or an array of strings.
 *                                     If the call type matches, the middleware will not run.
 * @param {Function} options.custom A test function that returns <code>true</code> / <code>false</code>.
 *        If the function returns <code>true</code> for the given request, the middleware will not run.
 *        The function will be passed the call context.
 * @return {Function} middleware
 *
 * @example
 * const requestId = require('mali-requestid')
 * const unless = require('mali-unless')
 * const CallType = require('mali-call-types')
 * const toJSON = require('mali-tojson')()
 *
 * const rid = requestId()
 * rid.unless = unless
 * app.use(rid.unless({ name: 'SomeMethod' }))
 *
 * toJSON.unless = unless
 * app.use(toJSON.unless({ type: [ CallType.DUPLEX, CallType.RESPONSE_STREAM ] }))
 *
 */
function unlessMiddleware (options) {
  const parent = this

  return function unless (ctx, next) {
    const skip = conditionTest(ctx, options)
    if (skip) {
      return next()
    }

    return parent(ctx, next)
  }
}

module.exports = unlessMiddleware

const CallType = require('mali-call-types')
const values = require('lodash.values')

const TYPE_VALUES = values(CallType)

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
  let opts = options
  if (typeof options === 'function') {
    opts = { custom: options }
  } else if (typeof options === 'string') {
    if (TYPE_VALUES.indexOf(options) >= 0) {
      opts = { type: options }
    } else {
      opts = { name: options }
    }
  } else if (options instanceof RegExp) {
    opts = { name: options }
  }

  return function unless (ctx, next) {
    let skip = false
    const callName = ctx.name
    const cn = callName.toLowerCase()
    const callType = ctx.type

    if (opts.custom) {
      skip = skip || opts.custom(ctx)
    }

    const names = !opts.name || Array.isArray(opts.name)
      ? opts.name : [opts.name]

    if (names) {
      skip = skip || names.some(n => {
        if (typeof n === 'string') {
          return n.toLowerCase() === cn
        } else if (n instanceof RegExp) {
          return n.exec(callName) ? true : false // eslint-disable-line no-unneeded-ternary
        }
      })
    }

    const types = !opts.type || Array.isArray(opts.type)
      ? opts.type : [opts.type]

    if (types) {
      skip = skip || types.some(t => typeof t === 'string' && t === callType)
    }

    if (skip) {
      return next()
    }

    return parent(ctx, next)
  }
}

module.exports = unlessMiddleware

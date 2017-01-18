# mali-unless

Conditionally add [Mali](https://github.com/malijs/mali) middleware

[![npm version](https://img.shields.io/npm/v/mali-unless.svg?style=flat-square)](https://www.npmjs.com/package/mali-unless)
[![build status](https://img.shields.io/travis/malijs/unless/master.svg?style=flat-square)](https://travis-ci.org/malijs/unless)

## Installation


```
npm install mali-unless
```


## API

<a name="module_mali-unless"></a>

### mali-unless ⇒ <code>function</code>
Mali unless middleware. Attach to any middleware and configure it to prevent/permit the
middleware in question to be executed.

**Returns**: <code>function</code> - middleware  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> &#124; <code>String</code> &#124; <code>RegExp</code> &#124; <code>function</code> | - If <code>string</code> and one of <code>Mali Call Types</code> do middleware        unless it is the specified call type        - If <code>string</code> and not a call type, assumed to be a call name, and        middleware is executed unless the call name is the name specified. Call names checks are not case sensitive.        - If <code>function</code> it's a test function that returns <code>true</code> / <code>false</code>.        If the function returns <code>true</code> for the given request, the middleware will not run.        The function will be passed the call context.        - If <code>RegExp</code> instance, if call name matches the regexp the middleware is skipped. |
| options.name | <code>String</code> &#124; <code>Regex</code> &#124; <code>Array</code> | A <code>string</code>, a <code>RegExp</code> or an array of any of those.                                          If the call name matches, the middleware will not run.                                          Call names checks are not case sensitive. |
| options.type | <code>String</code> &#124; <code>Array</code> | A <code>string</code> or an array of strings.                                     If the call type matches, the middleware will not run. |
| options.custom | <code>function</code> | A test function that returns <code>true</code> / <code>false</code>.        If the function returns <code>true</code> for the given request, the middleware will not run.        The function will be passed the call context. |

**Example**  

```js
const requestId = require('mali-requestid')
const unless = require('mali-unless')
const CallType = require('mali-call-types')
const toJSON = require('mali-tojson')()

const rid = requestId()
rid.unless = unless
app.use(rid.unless({ name: 'SomeMethod' }))

toJSON.unless = unless
app.use(toJSON.unless({ type: [ CallType.DUPLEX, CallType.RESPONSE_STREAM ] }))
```

## License

  Apache-2.0

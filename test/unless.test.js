import test from 'ava'
import path from 'path'
import caller from 'grpc-caller'
import CallType from 'mali-call-types'

import Mali from 'mali'
import unless from '../'

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getHostport (port) {
  return '0.0.0.0:'.concat(port || getRandomInt(1000, 60000))
}

const PROTO_PATH = path.resolve(__dirname, './unless.proto')

async function mw (ctx, next) {
  ctx.res = { executed: true }
  await next()
}

function testCall (ctx) {
  if (!ctx.res) {
    ctx.res = { executed: false }
  }
}

mw.unless = unless

test('should not call when string param as call method name', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless('TestCall'))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should not call when string param as call method name different case', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless('testCall'))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should not call when string param as call method type', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless(CallType.UNARY))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should not call when function param', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless(ctx => ctx.type === CallType.UNARY))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should not call when matching regexp param', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless(/stc/ig))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should call when string param as call method name and does not match a method', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless('TestCallFake'))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.true(response.executed)
  await app.close()
})

test('should call when string param as call method type no match', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless(CallType.DUPLEX))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.true(response.executed)
  await app.close()
})

test('should call when function param returns false', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless(ctx => ctx.type === CallType.DUPLEX))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.true(response.executed)
  await app.close()
})

test('should call when regexp param and no match', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless(/fake/ig))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.true(response.executed)
  await app.close()
})

test('should not call when specifying name option', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless({ name: 'TestCall' }))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should not call when specifying name option as an array', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless({ name: [ 'OtherTestCall', 'TestCall' ] }))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should not call when specifying name option as an array with regexp', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless({ name: [ 'OtherTestCall', /stc/ig ] }))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should not call when specifying type option', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless({ type: CallType.UNARY }))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should not call when specifying name type as an array', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless({ type: [ CallType.DUPLEX, CallType.UNARY ] }))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should not call when specifying custom function', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless({
    type: [ CallType.DUPLEX, CallType.REQUEST_STREAM ],
    name: [ 'OtherTestCall', /fake/ig ],
    custom: ctx => ctx.type === CallType.UNARY
  }))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.false(response.executed)
  await app.close()
})

test('should call when specifying all options and no match', async t => {
  t.plan(1)
  const host = getHostport()
  const app = new Mali(PROTO_PATH, 'Tester')
  app.use(mw.unless({
    type: [ CallType.DUPLEX, CallType.REQUEST_STREAM ],
    name: [ 'OtherTestCall', /fake/ig ],
    custom: ctx => ctx.type === CallType.DUPLEX
  }))
  app.use({testCall})
  app.start(host)

  const client = caller(host, PROTO_PATH, 'Tester')
  const response = await client.testCall({ message: 'hello' })
  t.true(response.executed)
  await app.close()
})

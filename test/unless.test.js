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

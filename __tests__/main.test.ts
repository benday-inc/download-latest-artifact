// import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import {JsonEditor} from '../src/JsonEditor'

// shows how the runner will run a javascript action with env / stdout protocol

test('make call to api', () => {
  let token = process.env['MYGITHUBTOKEN']

  expect(token).toBeDefined()
  expect(token).not.toBeNull()
  expect(token.length).toBeGreaterThan(0)

  console.log('current token: ' + token)

  process.env['INPUT_TOKEN'] = token

  process.env['ACTIONS_RUNNER_DEBUG'] = 'true'

  const systemUnderTest = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }

  let temp = cp.execSync(`node ${systemUnderTest}`, options).toString()
  console.log(temp)
})

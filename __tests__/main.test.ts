import * as sut from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import {JsonEditor} from '../src/JsonEditor'

// shows how the runner will run a javascript action with env / stdout protocol

test('make call to api', () => {
  let token = process.env['MYGITHUBTOKEN']
  // let token = process.env['ACTIONS_RUNTIME_TOKEN']

  expect(token).toBeDefined()
  expect(token).not.toBeNull()
  expect(token.length).toBeGreaterThan(0)

  console.log('current token: ' + token)

  process.env['INPUT_TOKEN'] = token

  process.env['ACTIONS_RUNNER_DEBUG'] = 'true'
  process.env['RUNNER_DEBUG'] = '1'

  const systemUnderTest = path.join(__dirname, '..', 'lib', 'main.js')
  // const systemUnderTest = path.join(__dirname, '..', 'src', 'main.ts')
  const options: sut.ExecSyncOptions = {
    env: process.env,
    stdio: [process.stdin, process.stdout, process.stderr]
  }

  // let temp = sut.execSync(`node ${systemUnderTest}`, options).toString()
  // console.log(temp)

  sut.execSync(`node ${systemUnderTest}`, options)
})

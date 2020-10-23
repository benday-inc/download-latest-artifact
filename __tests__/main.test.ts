import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import {JsonEditor} from '../src/JsonEditor'

// shows how the runner will run a javascript action with env / stdout protocol
test('set connection string in completely empty appsettings.json file', () => {
  var pathToTempConfigFile = createCopyOfSampleFile(
    'completely-empty-sample-appsettings.json'
  )

  const expectedConnectionStringName = 'dingdong'
  process.env['INPUT_NAME'] = expectedConnectionStringName
  const expectedConnectionStringValue = 'bing bong'
  process.env['INPUT_CONNECTIONSTRING'] = expectedConnectionStringValue
  process.env['INPUT_PATHTOSETTINGSFILE'] = pathToTempConfigFile
  process.env['ACTIONS_RUNNER_DEBUG'] = 'true'

  const systemUnderTest = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }

  assertConnectionStringValueIsNot(
    pathToTempConfigFile,
    expectedConnectionStringName,
    expectedConnectionStringValue
  )

  let temp = cp.execSync(`node ${systemUnderTest}`, options).toString()
  console.log(temp)

  assertConnectionStringValue(
    pathToTempConfigFile,
    expectedConnectionStringName,
    expectedConnectionStringValue
  )
})

test('set connection string in empty json appsettings.json file', () => {
  var pathToTempConfigFile = createCopyOfSampleFile(
    'empty-json-sample-appsettings.json'
  )

  const expectedConnectionStringName = 'dingdong'
  process.env['INPUT_NAME'] = expectedConnectionStringName
  const expectedConnectionStringValue = 'bing bong'
  process.env['INPUT_CONNECTIONSTRING'] = expectedConnectionStringValue
  process.env['INPUT_PATHTOSETTINGSFILE'] = pathToTempConfigFile
  process.env['ACTIONS_RUNNER_DEBUG'] = 'true'

  const systemUnderTest = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }

  assertConnectionStringValueIsNot(
    pathToTempConfigFile,
    expectedConnectionStringName,
    expectedConnectionStringValue
  )

  let temp = cp.execSync(`node ${systemUnderTest}`, options).toString()
  console.log(temp)

  assertConnectionStringValue(
    pathToTempConfigFile,
    expectedConnectionStringName,
    expectedConnectionStringValue
  )
})

test('set new connection string in an appsettings.json file with existing connection strings', () => {
  var pathToTempConfigFile = createCopyOfSampleFile(
    'sample-appsettings-with-connection-strings.json'
  )

  const expectedConnectionStringName = 'dingdong'
  process.env['INPUT_NAME'] = expectedConnectionStringName
  const expectedConnectionStringValue = 'bing bong'
  process.env['INPUT_CONNECTIONSTRING'] = expectedConnectionStringValue
  process.env['INPUT_PATHTOSETTINGSFILE'] = pathToTempConfigFile
  process.env['ACTIONS_RUNNER_DEBUG'] = 'true'

  const systemUnderTest = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }

  assertConnectionStringValueIsNot(
    pathToTempConfigFile,
    expectedConnectionStringName,
    expectedConnectionStringValue
  )

  let temp = cp.execSync(`node ${systemUnderTest}`, options).toString()
  console.log(temp)

  assertConnectionStringValue(
    pathToTempConfigFile,
    expectedConnectionStringName,
    expectedConnectionStringValue
  )
  assertConnectionStringValue(
    pathToTempConfigFile,
    'connstr1',
    'connstr1 value'
  )
  assertConnectionStringValue(
    pathToTempConfigFile,
    'connstr2',
    'connstr2 value'
  )
})

test('modify existing connection string in an appsettings.json file', () => {
  var pathToTempConfigFile = createCopyOfSampleFile(
    'sample-appsettings-with-connection-strings.json'
  )

  const expectedConnectionStringName = 'connstr1'
  process.env['INPUT_NAME'] = expectedConnectionStringName
  const expectedConnectionStringValue = 'connstr1 new value'
  process.env['INPUT_CONNECTIONSTRING'] = expectedConnectionStringValue
  process.env['INPUT_PATHTOSETTINGSFILE'] = pathToTempConfigFile
  process.env['ACTIONS_RUNNER_DEBUG'] = 'true'

  const systemUnderTest = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }

  assertConnectionStringValueIsNot(
    pathToTempConfigFile,
    expectedConnectionStringName,
    expectedConnectionStringValue
  )

  let temp = cp.execSync(`node ${systemUnderTest}`, options).toString()
  console.log(temp)

  assertConnectionStringValue(
    pathToTempConfigFile,
    expectedConnectionStringName,
    expectedConnectionStringValue
  )
})

function assertConnectionStringValue(
  pathToTempConfigFile: string,
  expectedConnectionStringName: string,
  expectedConnectionStringValue: string
) {
  const editor = new JsonEditor()
  editor.open(pathToTempConfigFile)

  expect(editor.getConnectionString(expectedConnectionStringName)).toBe(
    expectedConnectionStringValue
  )
}

function assertConnectionStringValueIsNot(
  pathToTempConfigFile: string,
  expectedConnectionStringName: string,
  expectedConnectionStringValue: string
) {
  const editor = new JsonEditor()
  editor.open(pathToTempConfigFile)

  expect(editor.getConnectionString(expectedConnectionStringName)).not.toBe(
    expectedConnectionStringValue
  )
}

function createCopyOfSampleFile(sampleFilename: string) {
  const now = Date.now().toString()

  var pathToFile = path.join(__dirname, sampleFilename)
  var pathToTempDir = path.join(__dirname, 'temp')
  var pathToTempDirForThisRun = path.join(pathToTempDir, now)

  if (!fs.existsSync(pathToTempDir)) {
    fs.mkdirSync(pathToTempDir)
  }

  if (!fs.existsSync(pathToTempDirForThisRun)) {
    fs.mkdirSync(pathToTempDirForThisRun)
  }

  var pathToTempConfigFile = path.join(pathToTempDirForThisRun, sampleFilename)

  fs.copyFileSync(pathToFile, pathToTempConfigFile)
  return pathToTempConfigFile
}

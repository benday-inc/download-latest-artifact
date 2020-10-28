import * as sut from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

// shows how the runner will run a javascript action with env / stdout protocol

test('make call to api', () => {
  const now = Date.now().toString()

  const pathToTempDir = path.join(
    os.homedir(),
    'actions-download-latest-artifact'
  )

  if (!fs.existsSync(pathToTempDir)) {
    fs.mkdirSync(pathToTempDir)
  }

  var pathToTempDirForThisRun = path.join(pathToTempDir, now)
  if (!fs.existsSync(pathToTempDirForThisRun)) {
    fs.mkdirSync(pathToTempDirForThisRun)
  }

  console.log(`download dir: ${pathToTempDirForThisRun}`)

  let token = process.env['MYGITHUBTOKEN']
  // let token = process.env['ACTIONS_RUNTIME_TOKEN']

  expect(token).toBeDefined()
  expect(token).not.toBeNull()
  expect(token.length).toBeGreaterThan(0)

  console.log('github token: ' + token)

  process.env['INPUT_TOKEN'] = token
  process.env['INPUT_REPOSITORY_OWNER'] = 'benday'
  process.env['INPUT_REPOSITORY_NAME'] = 'actionsdemo'
  process.env['INPUT_WORKFLOW_NAME'] = '.NET Core 2'
  process.env['INPUT_BRANCH_NAME'] = 'master'
  process.env['INPUT_DOWNLOAD_PATH'] = pathToTempDirForThisRun

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

import * as sut from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import AdmZip, * as zip from 'adm-zip'

// shows how the runner will run a javascript action with env / stdout protocol

test('download build-output artifact', () => {
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

  var expectedOutputFilename = 'actionsdemo-build-output.zip'

  console.log(`download dir: ${pathToTempDirForThisRun}`)

  let token = process.env['MYGITHUBTOKEN']

  expect(token).toBeDefined()
  expect(token).not.toBeNull()
  expect(token.length).toBeGreaterThan(0)

  console.log('github token: ' + token)

  process.env['INPUT_TOKEN'] = token
  process.env['INPUT_REPOSITORY_OWNER'] = 'benday'
  process.env['INPUT_REPOSITORY_NAME'] = 'actionsdemo'
  process.env['INPUT_ARTIFACT_NAME'] = 'build-output'
  process.env['INPUT_WORKFLOW_NAME'] = 'build'
  process.env['INPUT_BRANCH_NAME'] = 'master'
  process.env['INPUT_DOWNLOAD_PATH'] = pathToTempDirForThisRun
  process.env['INPUT_DOWNLOAD_FILENAME'] = expectedOutputFilename

  process.env['ACTIONS_RUNNER_DEBUG'] = 'true'
  process.env['RUNNER_DEBUG'] = '1'

  const systemUnderTest = path.join(__dirname, '..', 'lib', 'main.js')
  // const systemUnderTest = path.join(__dirname, '..', 'src', 'main.ts')
  const options: sut.ExecSyncOptions = {
    env: process.env,
    stdio: [process.stdin, process.stdout, process.stderr]
  }

  sut.execSync(`node ${systemUnderTest}`, options)

  var expectedFileDownloadPath = path.join(
    pathToTempDirForThisRun,
    expectedOutputFilename
  )

  console.log(`verifying file was downloaded to ${expectedFileDownloadPath}...`)

  var fileExists = fs.existsSync(expectedFileDownloadPath)
  expect(fileExists).toBe(true)

  console.log(`file was downloaded to ${expectedFileDownloadPath}...`)

  assertFileExistsInZip(expectedFileDownloadPath, 'Benday.Demo123.Api.dll')
  assertFileExistsInZip(expectedFileDownloadPath, 'Benday.Demo123.WebUi.dll')
})

test('download build-output-api-project artifact', () => {
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

  var expectedOutputFilename = 'actionsdemo-build-output-api-project.zip'

  console.log(`download dir: ${pathToTempDirForThisRun}`)

  let token = process.env['MYGITHUBTOKEN']

  expect(token).toBeDefined()
  expect(token).not.toBeNull()
  expect(token.length).toBeGreaterThan(0)

  console.log('github token: ' + token)

  process.env['INPUT_TOKEN'] = token
  process.env['INPUT_REPOSITORY_OWNER'] = 'benday'
  process.env['INPUT_REPOSITORY_NAME'] = 'actionsdemo'
  process.env['INPUT_ARTIFACT_NAME'] = 'build-output-api-project'
  process.env['INPUT_WORKFLOW_NAME'] = 'build'
  process.env['INPUT_BRANCH_NAME'] = 'master'
  process.env['INPUT_DOWNLOAD_PATH'] = pathToTempDirForThisRun
  process.env['INPUT_DOWNLOAD_FILENAME'] = expectedOutputFilename

  process.env['ACTIONS_RUNNER_DEBUG'] = 'true'
  process.env['RUNNER_DEBUG'] = '1'

  const systemUnderTest = path.join(__dirname, '..', 'lib', 'main.js')
  // const systemUnderTest = path.join(__dirname, '..', 'src', 'main.ts')
  const options: sut.ExecSyncOptions = {
    env: process.env,
    stdio: [process.stdin, process.stdout, process.stderr]
  }

  sut.execSync(`node ${systemUnderTest}`, options)

  var expectedFileDownloadPath = path.join(
    pathToTempDirForThisRun,
    expectedOutputFilename
  )

  console.log(`verifying file was downloaded to ${expectedFileDownloadPath}...`)

  assertFileExistsInZip(expectedFileDownloadPath, 'Benday.Demo123.Api.dll')
  assertFileDoesNotExistInZip(
    expectedFileDownloadPath,
    'Benday.Demo123.WebUi.dll'
  )
})

function assertFileExistsInZip(
  expectedFileDownloadPath: string,
  expectedFileInZip: string
) {
  var fileExists = fs.existsSync(expectedFileDownloadPath)
  expect(fileExists).toBe(true)

  console.log(`file was downloaded to ${expectedFileDownloadPath}...`)

  var actualFile = new AdmZip(expectedFileDownloadPath)

  var foundIt = false

  var entries = actualFile.getEntries()

  for (var entry of entries) {
    const entryName = entry.entryName

    if (entryName.endsWith(expectedFileInZip) === true) {
      foundIt = true
      break
    }
  }

  if (foundIt === false) {
    console.log(
      `Expected file named ${expectedFileInZip} in zip ${expectedFileDownloadPath}`
    )
  }

  expect(foundIt).toBe(true)
}

function assertFileDoesNotExistInZip(
  expectedFileDownloadPath: string,
  expectedFileInZip: string
) {
  var fileExists = fs.existsSync(expectedFileDownloadPath)
  expect(fileExists).toBe(true)

  console.log(`file was downloaded to ${expectedFileDownloadPath}...`)

  var actualFile = new AdmZip(expectedFileDownloadPath)

  var foundIt = false

  var entries = actualFile.getEntries()

  for (var entry of entries) {
    const entryName = entry.entryName

    if (entryName.endsWith(expectedFileInZip) === true) {
      foundIt = true
      break
    }
  }

  if (foundIt === true) {
    console.log(
      `Should not find a file named ${expectedFileInZip} in zip ${expectedFileDownloadPath}`
    )
  }

  expect(foundIt).toBe(false)
}

import * as core from '@actions/core'
import * as fs from 'fs'
import axios, {AxiosInstance} from 'axios'
import {Artifact} from './artifact'
import {ArtifactsResponse} from './artifacts-response'
import path from 'path'
import {Workflow} from './workflow'
import {WorkflowResponse} from './workflow-response'
import {WorkflowRun} from './workflow-run'
import {WorkflowRunsResponse} from './workflow-runs-response'

function writeDebug(message: string): void {
  // Console.debug(message)
  core.debug(message)
}

function getInputValue(key: string): string {
  if (!key || key === null || key === '') {
    core.setFailed(`Attempted to read input but key was null or empty`)
  } else {
    const val = core.getInput(key)

    if (!val || val === null || val === '') {
      core.setFailed(
        `Attempted to read input for key ${key} but value was null or empty`
      )
      return null
    } else {
      core.debug(`getInputValue(): ${key} - ${val}`)
      return val
    }
  }
}

async function run(): Promise<void> {
  try {
    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    writeDebug(`Starting...`)
    writeDebug(`Reading inputs...`)

    const repositoryOwner = getInputValue('repository_owner')
    const repositoryName = getInputValue('repository_name')
    const workflowName = getInputValue('workflow_name')
    const branchName = getInputValue('branch_name')
    const artifactName = getInputValue('artifact_name')
    const downloadPath = getInputValue('download_path')
    const downloadFilename = getInputValue('download_filename')
    const token = getInputValue('token')

    writeDebug('setting up api call')

    const githubClient = getClient(token, repositoryOwner, repositoryName)

    const workflow = await getWorkflowByName(githubClient, workflowName)

    if (!workflow || workflow === null) {
      writeDebug('workflow instance is null')
    }

    const latestRun = await getLatestRunForWorkflow(
      githubClient,
      workflow,
      branchName
    )
    const artifact = await getArtifactForWorkflowRun(
      githubClient,
      latestRun,
      artifactName
    )

    writeDebug('finished calling APIs')

    if (!artifact) {
      core.setFailed('Artifact result was null')
    } else {
      writeDebug(`Found artifact at ${artifact.url}`)
      writeDebug(`Downloading artifact from ${artifact.archive_download_url}`)

      await downloadFile(githubClient, artifact, downloadPath, downloadFilename)
    }
  } catch (error) {
    if (error instanceof Error) {
      const err: Error = error

      core.error(err)
      core.setFailed(err)
    } else {
      core.error('Someting went wrong.')
      core.error(JSON.stringify(error))
      core.error(JSON.stringify(error))
      core.setFailed(JSON.stringify(error))
    }
  }
}

run()

async function downloadFile(
  client: AxiosInstance,
  forArtifact: Artifact,
  toDirectory: string,
  toFilename: string
): Promise<void> {
  if (forArtifact === null) {
    core.setFailed('downloadFile was passed a null artifact')
    throw new Error('downloadFile was passed a null artifact')
  }

  if (!toFilename || toFilename === null || toFilename === '') {
    core.setFailed('downloadFile was passed a null workflowName')
    throw new Error('downloadFile was passed a null workflowName')
  }

  const toFilePath = path.join(toDirectory, `${toFilename}`)

  writeDebug(
    `downloadFile(): Downloading ${forArtifact.archive_download_url} to ${toDirectory} as ${toFilePath}`
  )

  if (!fs.existsSync(toDirectory)) {
    fs.mkdirSync(toDirectory)
  }
  try {
    const writer = fs.createWriteStream(toFilePath)

    writeDebug('downloadFile(): before call to await get')

    const response = await client.get(forArtifact.archive_download_url, {
      responseType: 'stream'
    })

    writeDebug('downloadFile(): after call to await get')

    if (response) {
      writeDebug(response.status.toString())
      writeDebug(response.statusText)
    }

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  } catch (err) {
    writeDebug('downloadFile(): encountered an error')
    writeDebug(typeof err)
    writeDebug(JSON.stringify(err))
    core.error(JSON.stringify(err))
    core.setFailed(JSON.stringify(err))
  }
}

async function getArtifactForWorkflowRun(
  client: AxiosInstance,
  forWorkflowRun: WorkflowRun,
  artifactName: string
): Promise<Artifact> {
  if (forWorkflowRun === null) {
    core.setFailed('getArtifactForWorkflowRun was passed a null workflow run')
    throw new Error('getArtifactForWorkflowRun was passed a null workflow run')
  }

  writeDebug(`Getting artifacts for workflow run ${forWorkflowRun.id}...`)
  writeDebug(
    `Getting artifacts for workflow run url ${forWorkflowRun.artifacts_url}...`
  )

  const url = forWorkflowRun.artifacts_url

  const temp = client.get<ArtifactsResponse>(url)

  const response = await temp

  if (!response || response === null || response.data === null) {
    core.setFailed(
      'Call to get artifacts for workflow run failed with undefined or null result'
    )
    return null
  } else if (response.data.total_count === 0) {
    core.setFailed(`No artifacts for workflow run ${forWorkflowRun.id}.`)
    return null
  } else {
    const matches = response.data.artifacts.filter(function (item) {
      if (item.name.toLowerCase() === artifactName.toLowerCase()) {
        return true
      } else {
        return false
      }
    })

    if (!matches || matches.length === 0) {
      core.setFailed(
        `No artifact named ${artifactName} found in workflow run ${forWorkflowRun.id}.`
      )
      return null
    }

    const match = matches[0]

    writeDebug(`Found workflow run artifact id ${match.id}.`)

    return match
  }
}

async function getLatestRunForWorkflow(
  client: AxiosInstance,
  forWorkflow: Workflow,
  branchName: string
): Promise<WorkflowRun> {
  if (!forWorkflow || forWorkflow === null) {
    core.setFailed('getLatestRunForWorkflow was passed a null workflow')
    throw new Error('getLatestRunForWorkflow was passed a null workflow')
  }

  writeDebug(`Getting runs for workflow ${forWorkflow.name}...`)

  const url = `actions/workflows/${forWorkflow.id}/runs`

  const temp = client.get<WorkflowRunsResponse>(url, {
    params: {status: 'success', branch: branchName}
  })

  const response = await temp

  if (!response || response === null || response.data === null) {
    core.setFailed(
      'Call to get workflow runs failed with undefined or null result'
    )
    return null
  } else if (response.data.total_count === 0) {
    core.setFailed(`No successful workflow runs for branch ${branchName} found`)
    return null
  } else {
    const match = response.data.workflow_runs[0]

    writeDebug(`Found workflow run id ${match.id}.`)

    return match
  }
}

async function getWorkflowByName(
  client: AxiosInstance,
  workflowName: string
): Promise<Workflow> {
  writeDebug(`Getting workflow by name for ${workflowName}...`)

  const temp = client.get<WorkflowResponse>(`actions/workflows`)

  const response = await temp

  if (!response || response === null || response.data === null) {
    core.setFailed(
      'Call to get workflow by name failed with undefined or null result'
    )
    return null
  } else if (response.data.total_count === 0) {
    core.setFailed(`No workflows found`)
    return null
  } else {
    const match = response.data.workflows.find(w => w.name === workflowName)

    if (!match || match === null) {
      core.setFailed(`Could not find workflow by name for ${workflowName}.`)
      return null
    } else {
      writeDebug(`Found workflow by name for ${workflowName}.`)
      return match
    }
  }
}

function getClient(
  token: string,
  repositoryOwner: string,
  repositoryName: string
): AxiosInstance {
  if (!token || token === null || token === '') {
    throw new Error('Git api token was null or empty')
  }

  const githubClient = axios.create({
    baseURL: `https://api.github.com/repos/${repositoryOwner}/${repositoryName}`,
    responseType: 'json',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  })

  /*
  githubClient.interceptors.request.use(x => {
    writeDebug('axios request log...')
    writeDebug(JSON.stringify(x))
    return x
  })

  githubClient.interceptors.response.use(x => {
    writeDebug('axios response log...')

    const msg = `${x.status} | ${JSON.stringify(x.data)}`

    writeDebug(msg)
    return x
  })
  */
  return githubClient
}

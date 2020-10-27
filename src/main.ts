import * as core from '@actions/core'
import axios, {AxiosInstance, AxiosResponse} from 'axios'
// import * as Console from 'console'
import {ArtifactsResponse} from './ArtifactsResponse'
import {Workflow} from './Workflow'
import {WorkflowResponse} from './WorkflowResponse'

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
      return val
    }
  }
}

async function run(): Promise<void> {
  let response: AxiosResponse<ArtifactsResponse> = null

  try {
    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    writeDebug(`Starting...`)
    writeDebug(`Reading inputs...`)

    const repositoryOwner = getInputValue('repository_owner')
    const repositoryName = getInputValue('repository_name')
    const workflowName = getInputValue('workflow_name')
    const token = getInputValue('token')

    writeDebug('setting up api call')

    const githubClient = getClient(token, repositoryOwner, repositoryName)

    const workflow = await getWorkflowByName(githubClient, workflowName)

    const temp = githubClient.get<ArtifactsResponse>(
      `repos/${repositoryOwner}/${repositoryName}/actions/artifacts?per_page=1`
    )

    response = await temp

    writeDebug('called api')

    if (!response) {
      core.setFailed('Response from api call was null')
    } else if (!response.data) {
      writeDebug('Response data is undefined')
    } else {
      writeDebug(`data artifact count: ${response.data.artifacts.length}`)

      // downloadFile(githubClient, downloadDir)
    }
  } catch (error) {
    core.error('boom?')
    core.error(JSON.stringify(error))
    core.setFailed(JSON.stringify(error))
  }
}

run()

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
  } else if (response.data.total_count === 0) {
    core.setFailed(`No workflows found`)
  } else {
    const match = response.data.workflows.find(w => w.name === workflowName)

    writeDebug(`Found workflow by name for ${workflowName}.`)

    return match
  }
}

function getClient(
  token: string,
  repositoryOwner: string,
  repositoryName: string
): AxiosInstance {
  const githubClient = axios.create({
    baseURL: `https://api.github.com/repos/${repositoryOwner}/${repositoryName}`,
    responseType: 'json',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  })

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
  return githubClient
}

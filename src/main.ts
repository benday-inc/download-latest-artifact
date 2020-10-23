import * as core from '@actions/core'
import axios, {AxiosResponse} from 'axios'
import {ArtifactsResponse} from './ArtifactsResponse'

async function run(): Promise<void> {
  let response: AxiosResponse<ArtifactsResponse> = null

  try {
    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(`Starting...`)
    core.debug(`Reading inputs...`)

    const token: string = core.getInput('token')
    core.debug(`Token: ${token} ...`)

    core.debug(`Token length: ${token.length} ...`)

    core.debug('calling api')

    const temp = axios
      .create({
        responseType: 'json',
        headers: {
          Authorization: `token ${token}`
        }
      })
      .get<ArtifactsResponse>(
        'https://api.github.com/repos/benday/actionsdemo/actions/artifacts'
      )

    response = await temp

    core.debug('called api')

    if (!response.data) {
      core.debug('data is undefined')
    } else {
      core.debug(`data artifact count: ${response.data.artifacts.length}`)
    }
  } catch (error) {
    core.error('boom?')
    core.error(JSON.stringify(error))
    core.error(JSON.stringify(response))
    core.setFailed(JSON.stringify(error))
  }
}

run()

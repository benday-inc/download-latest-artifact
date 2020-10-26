import * as core from '@actions/core'
import axios, {AxiosResponse} from 'axios'
import {ArtifactsResponse} from './ArtifactsResponse'
// import * as axiosLogging from 'axios-debug-log'

async function run(): Promise<void> {
  let response: AxiosResponse<ArtifactsResponse> = null

  try {
    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(`Starting...`)
    core.debug(`Reading inputs...`)

    const token: string = core.getInput('token')

    if (!token || token === null || token.length === 0 || token === 'default') {
      core.error('GitHub token was not set or was empty.')
    } else {
      core.debug(`Token: ${token} ...`)

      core.debug(`Token length: ${token.length} ...`)

      core.debug('calling api')

      const githubClient = axios.create({
        baseURL: 'https://api.github.com/',
        responseType: 'json',
        headers: {
          Authorization: `token ${token}`
        }
      })

      githubClient.interceptors.request.use(x => {
        core.debug('axios log...')
        core.debug(JSON.stringify(x))
        return x
      })

      const temp = githubClient.get<ArtifactsResponse>(
        'repos/benday/actionsdemo/actions/artifacts'
      )

      response = await temp

      core.debug('called api')

      if (!response.data) {
        core.debug('data is undefined')
      } else {
        core.debug(`data artifact count: ${response.data.artifacts.length}`)
      }
    }
  } catch (error) {
    core.error('boom?')
    core.error(JSON.stringify(error))
    core.error(JSON.stringify(response))
    core.setFailed(JSON.stringify(error))
  }
}

run()

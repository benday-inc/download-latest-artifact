import * as core from '@actions/core'
import axios, {AxiosResponse} from 'axios'
// import * as Console from 'console'
import {ArtifactsResponse} from './ArtifactsResponse'

function writeDebug(message: string): void {
  // Console.debug(message)
  core.debug(message)
}

async function run(): Promise<void> {
  let response: AxiosResponse<ArtifactsResponse> = null

  try {
    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    writeDebug(`Starting...`)
    writeDebug(`Reading inputs...`)

    const isDebug = core.isDebug()

    writeDebug(`isdebug: ${isDebug}`)

    const token: string = core.getInput('token')

    if (!token || token === null || token.length === 0 || token === 'default') {
      core.error('GitHub token was not set or was empty.')
    } else {
      writeDebug(`Token: ${token} ...`)

      writeDebug(`Token length: ${token.length} ...`)

      writeDebug('setting up api call')

      const githubClient = axios.create({
        baseURL: 'https://api.github.com/',
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

      writeDebug('calling api')

      const temp = githubClient.get<ArtifactsResponse>(
        'repos/benday/actionsdemo/actions/artifacts?per_page=1'
      )

      response = await temp

      writeDebug('called api')

      if (!response) {
        core.setFailed('Response from api call was null')
      } else if (!response.data) {
        writeDebug('Response data is undefined')
      } else {
        writeDebug(`data artifact count: ${response.data.artifacts.length}`)
      }
    }
  } catch (error) {
    core.error('boom?')
    core.error(JSON.stringify(error))
    core.setFailed(JSON.stringify(error))
  }
}

run()

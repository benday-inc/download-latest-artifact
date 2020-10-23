import * as core from '@actions/core'
import axios from 'axios'
import {ArtifactsResponse} from './ArtifactsResponse'

async function run(): Promise<void> {
  try {
    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(`Reading inputs...`)

    const token: string = core.getInput('token')
    core.debug(`Token: ${token} ...`)

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

    const data = (await temp).data

    core.debug('called api')

    if (!data) {
      core.debug('data is undefined')
    } else {
      core.debug(`data artifact count: ${data.artifacts.length}`)
    }
  } catch (error) {
    core.setFailed(error)
  }
}

run()

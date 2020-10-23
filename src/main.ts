import * as core from '@actions/core'
import axios from 'axios'

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
      .get<string>(
        'https://api.github.com/repos/benday/actionsdemo/actions/artifacts'
      )

    const data = (await temp).data

    core.debug('called api')

    core.debug(data)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

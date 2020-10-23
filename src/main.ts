import * as core from '@actions/core'
import {JsonEditor} from './JsonEditor'

async function run(): Promise<void> {
  try {
    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.debug(`Reading inputs...`)

    const name: string = core.getInput('name')
    core.debug(`Connection string name: ${name} ...`)

    const pathToSettingsFile: string = core.getInput(
      'PATHTOSETTINGSFILE'.toLowerCase()
    )
    core.debug(`Settings file: ${pathToSettingsFile} ...`)

    const connStringValue: string = core.getInput('connectionstring')
    core.debug(`Connection string value: ${connStringValue} ...`)

    core.debug('Creating instance of json editor...')
    const editor = new JsonEditor()
    core.debug('Json editor created.')

    core.debug('Opening file...')
    editor.open(pathToSettingsFile)
    core.debug('File opened.')

    core.debug('Setting connection string value...')
    editor.setConnectionString(name, connStringValue)
    core.debug('Connection string value set.')

    core.debug('Saving changes...')
    editor.save(pathToSettingsFile)
    core.debug('Changes saved.')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

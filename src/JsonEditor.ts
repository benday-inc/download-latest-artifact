import * as fs from 'fs'
import * as core from '@actions/core'

export class JsonEditor {
  Contents: string
  PathToFile: string
  ContentsAsJson: object

  constructor() {
    this.Contents = null
  }

  open(filename: string): void {
    try {
      core.debug('opening file...')
      const contents = fs.readFileSync(filename, 'utf8')
      core.debug('file opened.')

      this.Contents = contents

      if (contents.trim().length === 0) {
        this.Contents = '{}'
      }

      this.PathToFile = filename

      core.debug('Parsing json...')
      this.ContentsAsJson = JSON.parse(this.Contents.replace(/^\uFEFF/, ''))
      core.debug('Json parse complete.')
    } catch (error) {
      core.debug(error)
      throw error
    }
  }

  save(filename: string): void {
    fs.writeFileSync(filename, JSON.stringify(this.ContentsAsJson), 'utf8')
  }

  getConnectionString(key: string): string {
    return this.getValue('ConnectionStrings', key)
  }

  setConnectionString(key: string, value: string): void {
    this.setValue(value, 'ConnectionStrings', key)
  }

  getValue(key1: string, key2: string = null, key3: string = null): string {
    if (this.ContentsAsJson === null) {
      return null
    } else if (key1 === null) {
      return null
    } else {
      let returnValue: string

      if (
        key3 !== null &&
        key2 !== null &&
        key1 !== null &&
        this.ContentsAsJson[key1] &&
        this.ContentsAsJson[key1][key2]
      ) {
        returnValue = this.ContentsAsJson[key1][key2][key3]
      } else if (key2 !== null && key1 !== null && this.ContentsAsJson[key1]) {
        returnValue = this.ContentsAsJson[key1][key2]
      } else {
        returnValue = this.ContentsAsJson[key1]
      }

      if (!returnValue) {
        return null
      } else {
        return returnValue
      }
    }
  }

  setValue(
    theValue: string,
    key1: string,
    key2: string = null,
    key3: string = null
  ): void {
    if (this.ContentsAsJson === null) {
      return
    }

    if (key1 === null) {
      return
    } else if (key3 !== null && key2 !== null && key1 !== null) {
      this.ensureJsonPropertyExists(key1, key2)
      this.ContentsAsJson[key1][key2][key3] = theValue
    } else if (key2 !== null && key1 !== null) {
      this.ensureJsonPropertyExists(key1)
      this.ContentsAsJson[key1][key2] = theValue
    } else {
      this.ContentsAsJson[key1] = theValue
    }
  }

  private ensureJsonPropertyExists(key1: string, key2: string = null): void {
    if (key1 === null) {
      return
    } else if (!this.ContentsAsJson[key1]) {
      this.ContentsAsJson[key1] = {}
    }

    if (key2 === null) {
      return
    } else if (!this.ContentsAsJson[key1][key2]) {
      this.ContentsAsJson[key1][key2] = {}
    }
  }
}

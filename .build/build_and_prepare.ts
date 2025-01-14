import { execSync } from 'child_process'
import fs from 'fs'
import * as process from 'process'
;(() => {
  const [tag] = process.argv.slice(2)
  if (!tag) {
    console.error(`Expected a tag as an argument`)
    process.exit(1)
  }

  let packageName = ''
  if (tag.endsWith('-web')) {
    packageName = 'client-web'
  } else if (tag.endsWith('-node')) {
    packageName = 'client-node'
  } else if (tag.endsWith('-common')) {
    packageName = 'client-common'
  } else {
    console.error(`Provided tag ${tag} does not match any packages`)
    process.exit(1)
  }

  fs.copyFileSync(`./packages/${packageName}/package.json`, './package.json')

  const packageJson = require('../package.json')
  const version = require(`../packages/${packageName}/src/version.ts`).default
  console.log(`Current ${packageName} package version is: ${version}`)
  packageJson.version = version

  if (packageJson['dependencies']['@clickhouse/client-common']) {
    const commonVersion =
      require(`../packages/client-common/src/version.ts`).default
    console.log(`Updating client-common dependency to ${commonVersion}`)
    packageJson['dependencies']['@clickhouse/client-common'] = commonVersion
  }

  console.log('Updated package json:')
  console.log(packageJson)

  try {
    execSync(`./.scripts/build.sh ${packageName}`, { cwd: process.cwd() })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }

  try {
    fs.writeFileSync(
      './package.json',
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf-8'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
  process.exit(0)
})()

import fs from 'node:fs'
import path from 'node:path'

/** @type {{files: string[]}} */
const pkg = JSON.parse(String(fs.readFileSync('package.json')))

main()

async function main() {
  const files = fs
    .readdirSync('.')
    .filter(
      (fp) =>
        path.extname(fp) === '.js' &&
        path.basename(fp) !== 'build.js' &&
        path.basename(fp) !== 'test.js'
    )

  let index = -1

  while (++index < files.length) {
    const fp = files[index]

    if (!pkg.files.includes(fp)) {
      throw new Error(fp + ' should be in `package.json`’s files')
    }

    /** @type {{cuss: Record<string, number>}} */
    // eslint-disable-next-line no-await-in-loop
    const mod = await import('./' + fp)
    const input = mod.cuss
    const keys = Object.keys(input).sort()
    /** @type {Record<string, number>} */
    const output = {}
    let offset = -1

    while (++offset < keys.length) {
      output[keys[offset]] = input[keys[offset]]
    }

    fs.writeFileSync(
      fp,
      'export const cuss = ' + JSON.stringify(output, null, 2) + '\n'
    )

    console.log('✓ ' + fp + ' (' + keys.length + ')')
  }
}

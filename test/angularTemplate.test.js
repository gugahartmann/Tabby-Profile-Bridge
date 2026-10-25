'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const pug = require('pug')

test('Pug-generated Bridge settings template parses under Angular 15', async () => {
    // Webpack/Pug compilation alone does not reject invalid Angular expressions
    // such as inline arrow functions; Tabby would fail later at runtime JIT.
    const templatePath = path.join(__dirname, '..', 'src', 'bridge.component.pug')
    const html = pug.renderFile(templatePath)
    const { parseTemplate } = await import('@angular/compiler')
    const result = parseTemplate(html, templatePath, { preserveWhitespaces: false })
    assert.ok(!result.errors || !result.errors.length,
        (result.errors || []).map(e => e.toString()).join('\n'))
})

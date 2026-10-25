'use strict'
// Adapter catalog shared by the plugin and round-trip tests.
// To support another terminal format, register an adapter here with encode/decode,
// then add its id to the plugin's package/test manifest. Every adapter is automatically
// checked against the canonical YAML fixture.
const core = require('./bridgeCore')
const moba = require('./mobaCore')
const FORMATS = Object.freeze([
    {
        id: 'csv',
        label: 'CSV (.csv)',
        extension: '.csv',
        mimeType: 'text/csv;charset=utf-8',
        binary: false,
        encode: rows => core.stringifyCSV(rows),
        decode: data => ({ rows: core.readCSV(data), warnings: [] }),
    },
    {
        id: 'mxtsessions',
        label: 'MobaXterm (.mxtsessions)',
        extension: '.mxtsessions',
        mimeType: 'application/octet-stream',
        binary: true,
        encode: rows => moba.writeMoba(rows),
        decode: data => moba.readMoba(data),
    },
])
function getFormat(id) {
    const format = FORMATS.find(f => f.id === id)
    if (!format) throw new Error('Unsupported import/export format: ' + id)
    return format
}
function detectFormat(filename) {
    const lower = String(filename || '').toLowerCase()
    const format = FORMATS.find(f => lower.endsWith(f.extension))
    if (!format) throw new Error('Unsupported file format: ' + filename)
    return format
}
module.exports = { FORMATS, getFormat, detectFormat }

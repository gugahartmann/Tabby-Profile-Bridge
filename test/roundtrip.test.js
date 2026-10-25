'use strict'

/*
 * End-to-end data round-trip contract for every format adapter:
 *   Tabby YAML fixture -> export bytes/text -> import -> preview/plan -> Tabby model.
 *
 * We compare semantic trees (folder names and parents), not generated internal IDs.
 * Attributes the formats intentionally do not preserve (icons, colors, secrets) are
 * excluded; connection names, types, hosts, ports and allowed SSH usernames MUST match.
 *
 * All addresses/hostnames below come from the public, fictitious demo YAML.
 */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')
const core = require('../src/bridgeCore')
const { FORMATS, getFormat, detectFormat } = require('../src/exchangeFormats')

const fixtureFile = path.join(__dirname, 'fixtures', 'demo-profiles.yaml')
const demo = yaml.load(fs.readFileSync(fixtureFile, 'utf8'))
const sourceProfiles = demo.profiles
const sourceGroups = demo.groups

function sortedJSON(rows) {
    return rows.map(x => JSON.stringify(x)).sort()
}
function normalizedProfiles(profiles, groups, prefix = []) {
    return sortedJSON(profiles.map(profile => ({
        folder: [...prefix, ...core.groupPath(profile.group, groups)],
        name: profile.name,
        protocol: profile.type,
        hostname: profile.options.host,
        port: Number(profile.options.port || (profile.type === 'telnet' ? 23 : 22)),
        username: profile.options.user || '',
    })))
}
function normalizedGroups(groups) {
    return sortedJSON(groups.map(group => core.groupPath(group.id, groups)))
}
function expectedSubsetGroups(profiles, groups, prefix = []) {
    const folderPaths = new Map()
    for (const p of profiles) {
        const names = [...prefix, ...core.groupPath(p.group, groups)]
        for (let i = 1; i <= names.length; i++) {
            const folder = names.slice(0,i)
            folderPaths.set(JSON.stringify(folder), folder)
        }
    }
    return sortedJSON([...folderPaths.values()])
}
function exportImport(adapter, profiles, options = {}) {
    const { exportParent = '', importParent = '', selectedIds = new Set(profiles.map(p=>p.id)),
        includeUsernames = true } = options
    const selectedProfiles = profiles.filter(p => selectedIds.has(p.id))
    const users = includeUsernames ?
        new Set(selectedProfiles.map(p => p.options.user).filter(Boolean)) : new Set()
    const exportRows = core.rowsForExport(profiles,sourceGroups,selectedIds,users,exportParent)
    // Important: read the ACTUAL serialized format, not the original exportRows.
    const serialized = adapter.encode(exportRows)
    if (adapter.binary) assert.ok(serialized instanceof Uint8Array,
        adapter.id + ' should export a binary byte stream')
    else assert.equal(typeof serialized, 'string',adapter.id + ' should export text')
    const imported = adapter.decode(serialized)
    assert.deepEqual(imported.warnings, [],
        adapter.id + ' should round-trip the reference fixture without warnings')
    const preview = core.makePreview(imported.rows, [], [], importParent)
    assert.equal(preview.length, selectedProfiles.length)
    assert.ok(preview.every(p => p.action === 'create'))
    let next = 0
    const plan = core.buildPlan(preview, [], () => 'roundtrip-' + (++next))
    assert.equal(plan.replaces.length, 0)
    assert.equal(plan.creates.length, selectedProfiles.length)
    return { imported, preview, plan, serialized, selectedProfiles }
}

test('reference YAML is safe and contains required coverage', () => {
    assert.equal(demo.version, 1)
    assert.equal(sourceGroups.length, 10)
    assert.equal(sourceProfiles.length, 16)
    assert.ok(sourceProfiles.every(p=>p.type==='ssh'))
    assert.ok(sourceProfiles.every(p=>/\.invalid$|^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(p.options.host)))
    assert.ok(sourceProfiles.some(p=>p.options.port===2222))
    assert.ok(sourceProfiles.some(p=>p.options.user===''))
    assert.ok(sourceGroups.some(g=>g.name==='Backbone & Core' && g.parentGroupId==='demo-north'))
    assert.ok(sourceGroups.some(g=>g.name==='Backbone & Core' && g.parentGroupId==='demo-south'))
})

test('adapter catalog is complete and usable by both UI and round-trip tests',()=>{
    assert.deepEqual(FORMATS.map(f=>f.id).sort(), ['csv','mxtsessions'])
    for (const f of FORMATS) {
        assert.equal(getFormat(f.id), f)
        assert.equal(detectFormat('example'+f.extension), f)
        assert.equal(typeof f.encode,'function')
        assert.equal(typeof f.decode,'function')
    }
})

for (const adapter of FORMATS) {
    test(adapter.id + ': YAML -> export -> import preserves all groups and 16 connections',()=>{
        const result = exportImport(adapter, sourceProfiles)
        assert.deepEqual(
            normalizedProfiles(result.plan.creates, result.plan.groups),
            normalizedProfiles(sourceProfiles, sourceGroups),
            adapter.id + ': changed name, hierarchy, host, port, protocol or username'
        )
        assert.deepEqual(normalizedGroups(result.plan.groups), normalizedGroups(sourceGroups),
            adapter.id + ': lost, renamed or reparented group')
        assert.equal(result.plan.groups.length, 10)
        assert.equal(result.plan.creates.length, 16)
        const customPort = result.plan.creates.find(p=>p.name.includes('MONITOR-DC-01'))
        assert.equal(customPort.options.port,2222)
        assert.equal(result.plan.creates.filter(p=>p.options.user==='').length,3)
        console.log('ROUNDTRIP PASS '+adapter.id+' | groups=10 | profiles=16 | customPorts=1 | emptyUsers=3')
    })

    test(adapter.id + ': export container and per-file import container preserve nesting',()=>{
        const exportParent='Shared Export'
        const importParent='Imported File'
        const result=exportImport(adapter,sourceProfiles,{exportParent,importParent})
        const prefix=[importParent,exportParent]
        assert.deepEqual(
            normalizedProfiles(result.plan.creates,result.plan.groups),
            normalizedProfiles(sourceProfiles,sourceGroups,prefix))
        assert.deepEqual(
            normalizedGroups(result.plan.groups),
            expectedSubsetGroups(sourceProfiles,sourceGroups,prefix))
        assert.equal(result.plan.groups.length, 12)
    })

    test(adapter.id + ': subset export creates only ancestor groups, respecting duplicate names',()=>{
        const selectedIds = new Set(sourceProfiles.filter(p=>p.group==='demo-north-core').map(p=>p.id))
        const selectedProfiles=sourceProfiles.filter(p=>selectedIds.has(p.id))
        assert.equal(selectedProfiles.length,3)
        const result=exportImport(adapter,sourceProfiles,{selectedIds})
        assert.deepEqual(
            normalizedProfiles(result.plan.creates,result.plan.groups),
            normalizedProfiles(selectedProfiles,sourceGroups))
        assert.deepEqual(
            normalizedGroups(result.plan.groups),
            expectedSubsetGroups(selectedProfiles,sourceGroups))
        assert.equal(result.plan.groups.length,3)
    })

    test(adapter.id + ': redacted username export intentionally blanks all users',()=>{
        const result=exportImport(adapter,sourceProfiles,{includeUsernames:false})
        assert.ok(result.plan.creates.every(p=>p.options.user===''))
        assert.deepEqual(
            normalizedProfiles(result.plan.creates,result.plan.groups),
            normalizedProfiles(sourceProfiles.map(p=>({...p,options:{...p.options,user:''}})),sourceGroups))
    })

    test(adapter.id + ': re-import into existing tree detects conflicts without automatic overwrite',()=>{
        const ids=new Set(sourceProfiles.map(p=>p.id))
        const rows=core.rowsForExport(sourceProfiles,sourceGroups,ids,
            new Set(sourceProfiles.map(p=>p.options.user)), '')
        const imported=adapter.decode(adapter.encode(rows))
        const preview=core.makePreview(imported.rows,sourceProfiles,sourceGroups)
        assert.equal(preview.length,16)
        assert.ok(preview.every(p=>p.action==='skip' && p.matchedId))
        // An explicit replacement must target the same internal profile ID.
        const changed=preview.find(p=>p.name.includes('MONITOR-DC-01'))
        changed.action='replace'
        changed.editedUser='migration-test'
        let next=0
        const plan=core.buildPlan(preview,sourceGroups,()=> 'r-'+(++next))
        assert.equal(plan.creates.length,0)
        assert.equal(plan.replaces.length,1)
        assert.equal(plan.replaces[0].id,
            sourceProfiles.find(p=>p.name===changed.name).id)
        assert.equal(plan.replaces[0].options.user,'migration-test')
        assert.equal(plan.groups.length,0)
    })
}

test('negative control: structural comparison catches a silent port or folder change',()=>{
    const copied=sourceProfiles.map(p=>({...p,options:{...p.options}}))
    copied[0].options.port=2200
    assert.notDeepEqual(normalizedProfiles(copied,sourceGroups),
        normalizedProfiles(sourceProfiles,sourceGroups))
    const changedGroups=sourceGroups.map(g=>({...g}))
    changedGroups.find(g=>g.id==='demo-north-core').parentGroupId='demo-south'
    assert.notDeepEqual(normalizedGroups(changedGroups),normalizedGroups(sourceGroups))
})

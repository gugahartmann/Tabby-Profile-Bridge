'use strict'
/* Tabby Profile Bridge - portable, intentionally credential-free exchange format.
 * No executable scripts, passwords, key material or local paths are serialized.
 */
const HEADERS = ['group1','group2','other_groups','profile','protocol','hostname','port','username','auth','algorithms','settings']
const MAX_ROWS = 10000
const MAX_BYTES = 5 * 1024 * 1024
const ALGO_KEYS = ['hmac','kex','cipher','serverHostKey','compression']
const SETTING_KEYS = ['x11','skipBanner','agentForward','keepaliveInterval','keepaliveCountMax','readyTimeout','term','reuseSession','warnOnClose']
const TYPES = new Set(['ssh','telnet'])
function fail(message) { throw new Error(message) }
function ok(b, m) { if (!b) fail(m) }
function str(s, limit = 512) { return typeof s === 'string' && s.length <= limit }
function obj(o) { return !!o && typeof o === 'object' && !Array.isArray(o) && Object.getPrototypeOf(o) === Object.prototype }
function safeCell(s) { s = String(s == null ? '' : s); return /^[=+@\- \t\r\n]*[=+@\-]/.test(s) ? "'" + s : s }
function unsafeCell(s) { return s.startsWith("'") && /^[=+@\- \t\r\n]*[=+@\-]/.test(s.slice(1)) ? s.slice(1) : s }
function csvEscape(s) { s = safeCell(s); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s }
function stringifyCSV(rows) {
    return '\uFEFF' + [HEADERS.join(','), ...rows.map(r => HEADERS.map(k => csvEscape(r[k])).join(','))].join('\r\n') + '\r\n'
}
function csvMatrix(s) {
    ok(str(s, MAX_BYTES),'CSV file is too large')
    s = s.replace(/^\uFEFF/,'')
    const lines = []; let row=[], cell='', quoted=false, afterQuote=false
    for (let i=0;i<s.length;i++) {
        const c=s[i]
        if (quoted) {
            if (c==='"' && s[i+1]==='"') { cell+='"'; i++ }
            else if (c==='"') { quoted=false; afterQuote=true }
            else cell+=c
        } else if (c==='"' && !cell && !afterQuote) quoted=true
        else if (c===',') { row.push(unsafeCell(cell));cell='';afterQuote=false }
        else if (c==='\n' || c==='\r') {
            if (c==='\r' && s[i+1]==='\n') i++
            row.push(unsafeCell(cell)); if (row.some(v=>v!=='')) lines.push(row)
            row=[];cell='';afterQuote=false
        } else {
            ok(!afterQuote || /\s/.test(c),'Unexpected text after CSV quote')
            cell+=c
        }
        ok(cell.length <= 10000, 'CSV cell is too long')
    }
    ok(!quoted,'Unclosed CSV quote')
    if (cell || row.length) { row.push(unsafeCell(cell)); lines.push(row) }
    return lines
}
function splitOther(s) {
    if (!s) return []
    const parts=[];let buf='',escape=false
    for (const c of s) {
        if (escape) { buf+=c;escape=false }
        else if (c==='\\') escape=true
        else if (c==='/') { parts.push(buf.trim());buf='' }
        else buf+=c
    }
    if (escape) buf+='\\'
    parts.push(buf.trim())
    ok(parts.every(Boolean),'Empty intermediate folder')
    return parts
}
function joinOther(parts) { return parts.map(s => s.replace(/\\/g,'\\\\').replace(/\//g,'\\/')).join(' / ') }
function normalizeProtocol(v) { return String(v||'ssh').toLowerCase().trim() }
function validateRow(row,index) {
    const p=normalizeProtocol(row.protocol)
    ok(TYPES.has(p),'Row '+index+': unsupported protocol')
    ok(str(row.profile) && !!row.profile.trim(),'Row '+index+': missing profile name')
    ok(str(row.hostname,255) && !!row.hostname.trim(),'Row '+index+': missing hostname')
    ok(str(row.username||'',255),'Row '+index+': invalid username')
    ok(/^\d{1,5}$/.test(String(row.port||'')) && +row.port>=1 && +row.port<=65535,'Row '+index+': invalid port')
    const path=[row.group1,row.group2,...splitOther(row.other_groups)].filter(Boolean)
    ok(path.length<=32 && path.every(x=>str(x,256)),'Row '+index+': invalid folder depth/name')
    let algorithms={}
    if (row.algorithms) {
        try { algorithms=JSON.parse(row.algorithms) } catch { fail('Row '+index+': invalid algorithms JSON') }
        ok(obj(algorithms),'Row '+index+': invalid algorithms object')
        for (const [key,value] of Object.entries(algorithms)) {
            ok(ALGO_KEYS.includes(key) && Array.isArray(value) && value.length<=64 &&
                value.every(v=>str(v,128) && /^[a-zA-Z0-9_.@,+-]+$/.test(v)),'Row '+index+': invalid SSH algorithms')
        }
    }
    let settings={}
    if (row.settings) {
        try { settings=JSON.parse(row.settings) } catch { fail('Row '+index+': invalid settings JSON') }
        ok(obj(settings),'Row '+index+': invalid settings')
        for (const [key,value] of Object.entries(settings)) {
            ok(SETTING_KEYS.includes(key),'Row '+index+': unsupported setting '+key)
            if (['term'].includes(key)) ok(str(value,80),'Invalid terminal')
            else if (['keepaliveInterval','keepaliveCountMax','readyTimeout'].includes(key)) ok(value===null || (Number.isInteger(value) && value>=0 && value<=2147483647),'Invalid timeout')
            else ok(value===null || typeof value==='boolean','Invalid boolean option')
        }
    }
    ok(['','password','publicKey','agent','keyboardInteractive'].includes(row.auth||''),'Row '+index+': unsupported authentication')
    return {
        path, name: row.profile, type:p,
        options:{host:row.hostname,port:Number(row.port),user:row.username||'',
            ...(row.auth?{auth:row.auth}:{}),
            ...(Object.keys(algorithms).length?{algorithms}:{}),...settings}
    }
}
function readCSV(content) {
    const matrix=csvMatrix(content)
    ok(matrix.length>=1,'CSV file is empty')
    const fields=matrix.shift().map(x=>x.trim().toLowerCase())
    const aliases={name:'profile',host:'hostname',user:'username',folder1:'group1',folder2:'group2',group3:'other_groups'}
    const mapped=fields.map(f=>aliases[f]||f)
    ok(new Set(mapped).size===mapped.length,'Duplicate CSV headers')
    for (const key of ['profile','hostname','port']) ok(mapped.includes(key),'Required CSV column missing: '+key)
    ok(matrix.length<=MAX_ROWS,'Too many sessions in CSV')
    return matrix.map((line,i)=>{
        ok(line.length<=mapped.length,'Row '+(i+2)+': unexpected columns')
        const row={};mapped.forEach((k,j)=>row[k]=line[j]||'')
        return validateRow(row,i+2)
    })
}
function optionsForExport(profile) {
    const o=profile.options||{}
    const algorithms={}
    if (obj(o.algorithms)) for(const key of ALGO_KEYS) {
        const list=o.algorithms[key]
        if (Array.isArray(list) && list.length<=64 && list.every(x=>str(x,128) && /^[a-zA-Z0-9_.@,+-]+$/.test(x))) {
            if (list.length) algorithms[key]=list
        }
    }
    const settings={}
    for(const key of SETTING_KEYS) {
        const v=o[key]
        if (v===undefined) continue
        if (key==='term' && str(v,80)) settings[key]=v
        else if (['keepaliveInterval','keepaliveCountMax','readyTimeout'].includes(key) && (v===null||(Number.isInteger(v)&&v>=0&&v<=2147483647))) settings[key]=v
        else if (v===null||typeof v==='boolean') settings[key]=v
    }
    return {algorithms,settings}
}
function groupPath(id,groups) {
    const byId=new Map(groups.map(g=>[g.id,g]));const result=[],seen=new Set()
    while(id && byId.has(id)) {
        ok(!seen.has(id),'Circular group detected');seen.add(id)
        const g=byId.get(id);ok(str(g.name,256),'Invalid group name')
        result.unshift(g.name);id=g.parentGroupId
        ok(result.length<=32,'Group depth exceeds 32 levels')
    }
    return result
}
function rowsForExport(profiles,groups,selectedIds,allowedUsers,folder='') {
    const included=profiles.filter(p=>selectedIds.has(p.id) && TYPES.has(p.type))
    ok(included.length && included.length<=MAX_ROWS,'Select 1 to 10000 connections')
    const rows=included.map(p=>{
        const o=p.options||{}
        ok(str(p.name) && !!p.name.trim(),'Invalid name')
        ok(str(o.host,255) && !!o.host.trim(),'Missing hostname: '+p.name)
        const path=[...(folder?[folder]:[]),...groupPath(p.group,groups)]
        const details=optionsForExport(p)
        return {group1:path[0]||'', group2:path[1]||'', other_groups:joinOther(path.slice(2)),
            profile:p.name,protocol:p.type,hostname:o.host,port:String(o.port||(p.type==='ssh'?22:23)),
            username:allowedUsers.has(o.user)?o.user:'', auth:['password','publicKey','agent','keyboardInteractive'].includes(o.auth)?o.auth:'',
            algorithms:Object.keys(details.algorithms).length?JSON.stringify(details.algorithms):'',
            settings:Object.keys(details.settings).length?JSON.stringify(details.settings):''}
    })
    rows.forEach((r,i)=>validateRow(r,i+2));return rows
}
function usersOf(profiles) {
    const map=new Map()
    profiles.forEach(p=>{ const u=p.options?.user;if(u)map.set(u,(map.get(u)||0)+1) })
    return [...map].sort((a,b)=>a[0].localeCompare(b[0])).map(([user,count])=>({user,count}))
}
function identity(profile,path) { return [profile.type,...path,profile.name].map(s=>String(s||'').toLowerCase()).join('\x1f') }
function fingerprint(profile) {const o=profile.options||{};return [profile.type,o.host||'',o.port||((profile.type==='ssh')?22:23),o.user||''].map(s=>String(s).toLowerCase()).join('\x1f') }
function makePreview(importRows,existingProfiles,existingGroups,wrapper='') {
    ok(str(wrapper,256),'Invalid wrapper folder')
    return importRows.map((p,index)=>{
        const path=[...(wrapper?[wrapper]:[]),...p.path]
        const exact=existingProfiles.find(x=>identity(x,groupPath(x.group,existingGroups))===identity(p,path))
        const endpoint=existingProfiles.find(x=>fingerprint(x)===fingerprint(p))
        return {...p,index,path,matchedId:exact?.id||'',sameEndpointId:endpoint?.id||'',
            action:exact?'skip':'create'}
    })
}
function buildPlan(preview,existingGroups,idFactory) {
    ok(Array.isArray(preview)&&typeof idFactory==='function','Invalid plan')
    const groups=existingGroups.map(g=>({...g}))
    const createdGroups=[],creates=[],replaces=[],usedNames=new Set()
    function findGroup(name,parent) {return groups.find(g=>g.name===name && (g.parentGroupId||'')===(parent||''))}
    for(const p of preview) {
        if (p.action==='skip') continue
        ok(p.action==='create'||p.action==='replace','Invalid action')
        ok(!usedNames.has(p.index),'Duplicate import row');usedNames.add(p.index)
        let parent=''
        for(const name of p.path) {
            let g=findGroup(name,parent)
            if(!g) { g={id:idFactory(),name,...(parent?{parentGroupId:parent}:{})}; groups.push(g);createdGroups.push(g) }
            parent=g.id
        }
        const profile={type:p.type,name:p.name,group:parent,
            options:{...p.options, ...(p.editedUser!==undefined?{user:p.editedUser}:{})}}
        ok(str(profile.options.user||'',255),'Invalid edited username')
        if (p.action==='replace') {
            ok(p.matchedId,'Cannot replace without an exact match')
            replaces.push({...profile,id:p.matchedId})
        } else creates.push({...profile,id:p.type+':custom:bridge:'+idFactory()})
    }
    return {groups:createdGroups,creates,replaces}
}
module.exports={HEADERS,MAX_BYTES,MAX_ROWS,readCSV,stringifyCSV,rowsForExport,usersOf,groupPath,makePreview,buildPlan,validateRow,splitOther,joinOther}

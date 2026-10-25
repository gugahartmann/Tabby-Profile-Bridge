'use strict'
/* MobaXterm bookmarks adapter.
 * Limited to the documented, safe subset of SSH and Telnet.
 * No credentials, key paths, macros, proxies or custom terminal colors are transferred.
 */
const bridge=require('./bridgeCore')
const SSH_DEFAULT='0%localhost%22%%%-1%-1%%%%%0%0%0%%%-1%0%0%0%%1080%%0%0%1%%0%%%%0%-1%-1%0'.split('%')
const TERM_DEFAULT='MobaFont%10%0%0%-1%15%236,236,236%30,30,30%180,180,192%0%-1%0%%xterm%-1%0%_Std_Colors_0_%80%24%0%0%-1%<none>%%0%0%-1%-1'.split('%')
const EXTRAS=new Map([
[0x20ac,0x80],[0x201a,0x82],[0x0192,0x83],[0x201e,0x84],
[0x2026,0x85],[0x2020,0x86],[0x2021,0x87],[0x02c6,0x88],
[0x2030,0x89],[0x0160,0x8a],[0x2039,0x8b],[0x0152,0x8c],
[0x017d,0x8e],[0x2018,0x91],[0x2019,0x92],[0x201c,0x93],
[0x201d,0x94],[0x2022,0x95],[0x2013,0x96],[0x2014,0x97],
[0x02dc,0x98],[0x2122,0x99],[0x0161,0x9a],[0x203a,0x9b],
[0x0153,0x9c],[0x017e,0x9e],[0x0178,0x9f]
])
function win1252(text) {
    const bytes=[]
    for(const char of text){
        const n=char.codePointAt(0)
        if((n<=0x7f)||(n>=0xa0&&n<=0xff))bytes.push(n)
        else if(EXTRAS.has(n))bytes.push(EXTRAS.get(n))
        else throw Error('MobaXterm Windows-1252 cannot encode character U+'+n.toString(16).toUpperCase()+'. Rename the affected group/session.')
    }
    return new Uint8Array(bytes)
}
function decode(bytes) {
    return new TextDecoder('windows-1252',{fatal:false}).decode(bytes)
}
function validComponent(s,what) {
    if(typeof s!=='string'||!s.trim()||/[\r\n=#%\\]/.test(s))throw Error('Invalid MobaXterm '+what+': rename to remove newlines, =, #, %, or backslash')
    return s
}
function validatePath(parts) {
    if(!Array.isArray(parts)||parts.length>32)throw Error('Invalid MobaXterm group depth')
    for(const s of parts)validComponent(s,'folder')
    return parts.join('\\')
}
function sessionLine(row) {
    validComponent(row.name,'session')
    if(/[%#\r\n]/.test(row.options.host)||/[%#\r\n]/.test(row.options.user||''))throw Error('Unsupported MobaXterm delimiter in host/username')
    const o=row.options
    if(row.type==='telnet')return row.name+'=#98#1%'+o.host+'%'+o.port+'%'+(o.user||'')+'%'
    if(row.type!=='ssh')throw Error('Unsupported MobaXterm protocol')
    const a=[...SSH_DEFAULT],t=[...TERM_DEFAULT]
    a[1]=o.host;a[2]=String(o.port);a[3]=o.user||''
    a[5]=o.x11?'-1':'0'
    a[12]=a[3]?'0':'-1'
    a[14]='';a[7]='';a[8]='';a[9]='';a[10]='';a[15]='';a[19]='0';a[20]='';a[22]='';a[26]=''
    if(o.agentForward!==undefined)a[34]=o.agentForward?'-1':'0'
    const allowedTerm=['xterm','xterm-256color','vt100','vt220','vt400','xterm-r6']
    if(allowedTerm.includes(o.term))t[13]=o.term
    return row.name+'=#109#'+a.join('%')+'#'+t.join('%')+'#0# #-1'
}
function writeMoba(rows) {
    if(!Array.isArray(rows)||!rows.length||rows.length>bridge.MAX_ROWS)throw Error('Select 1 to 10000 profiles')
    const entries=[],byPath=new Map()
    function section(path) {
        const key=path.join('\x1f')
        if(!byPath.has(key)){const item={path:[...path],sessions:[]};entries.push(item);byPath.set(key,item)}
        return byPath.get(key)
    }
    section([])
    for(const row of rows){
        const path=Array.isArray(row.path)?row.path:bridge.validateRow(row,1).path
        validatePath(path)
        for(let n=1;n<=path.length;n++)section(path.slice(0,n))
        const obj=Array.isArray(row.path)?row:bridge.validateRow(row,1)
        section(path).sessions.push(sessionLine(obj))
    }
    const blocks=entries.map((entry,index)=>{
        const heading=index?'[Bookmarks_'+index+']':'[Bookmarks]'
        return [heading,'SubRep='+entry.path.join('\\'),'ImgNum='+(index?'41':'42'),...entry.sessions].join('\r\n')
    })
    return win1252(blocks.join('\r\n')+'\r\n')
}
function readMoba(input) {
    const text=typeof input==='string'?input:decode(input)
    if(text.length>bridge.MAX_BYTES)throw Error('MobaXterm file exceeds 5 MB')
    const rows=[],warnings=[]
    let path=[],inBookmarks=false,found=false
    for(const original of text.replace(/^\uFEFF/,'').split(/\r?\n/)){
        const line=original.trim()
        if(!line||line.startsWith(';')||line.startsWith('#'))continue
        if(/^\[/.test(line)){
            inBookmarks=/^\[Bookmarks(?:_\d+)?\]$/i.test(line)
            if(inBookmarks){found=true;path=[]}
            continue
        }
        if(!inBookmarks)continue
        if(/^SubRep=/i.test(line)){
            const raw=line.slice(line.indexOf('=')+1)
            path=raw?raw.split('\\'):[]
            if(path.length>32)throw Error('MobaXterm has more than 32 group levels')
            continue
        }
        if(/^(ImgNum|Expanded)=/i.test(line))continue
        const equal=line.indexOf('=')
        if(equal<=0)continue
        const name=line.slice(0,equal).trim()
        const value=line.slice(equal+1).trim()
        const match=/#(109|98)#([01])%/.exec(value)
        if(!match){warnings.push('Unsupported session type ignored: '+name);continue}
        const type=match[1]==='109'&&match[2]==='0'?'ssh':match[1]==='98'&&match[2]==='1'?'telnet':null
        if(!type){warnings.push('Unsupported session type ignored: '+name);continue}
        const detail=value.slice(match.index).split('#')[2]
        const fields=detail.split('%')
        const candidate={group1:path[0]||'',group2:path[1]||'',other_groups:bridge.joinOther(path.slice(2)),
          profile:name,protocol:type,hostname:fields[1]||'',port:fields[2]||String(type==='ssh'?22:23),
          username:fields[3]==='<default>'?'':(fields[3]||''),auth:'',algorithms:'',settings:''}
        if(type==='ssh'){
            const settings={}
            if(fields.length>5)settings.x11=fields[5]==='-1'
            if(Object.keys(settings).length)candidate.settings=JSON.stringify(settings)
            if(fields[7]||fields[8]||fields[14]||fields[20]||fields[26])warnings.push('Advanced settings not transferred: '+name)
        }
        try {rows.push(bridge.validateRow(candidate,rows.length+1))} catch(e){warnings.push('Ignored invalid session '+name+': '+String(e.message||e))}
        if(rows.length>bridge.MAX_ROWS)throw Error('Too many MobaXterm sessions')
    }
    if(!found)throw Error('No MobaXterm [Bookmarks] sections found')
    return {rows,warnings}
}
module.exports={readMoba,writeMoba,decode,win1252,SSH_DEFAULT,TERM_DEFAULT}

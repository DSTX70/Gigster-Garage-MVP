import fs from 'node:fs'; import path from 'node:path';
const deny=[/API_KEY/i,/SECRET/i,/PASSWORD/i]; const scan=[]; const root='.';
function walk(d){ for(const e of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,e.name);
 if(e.isDirectory()){ if(['node_modules','.git','.cache','build','public'].includes(e.name)) continue; walk(p); }
 else if(/\.(ts|tsx|json|yml|yaml|env|md)$/i.test(e.name)) scan.push(p); } }
walk(root); let issues=[]; for(const f of scan){ const s=fs.readFileSync(f,'utf8'); for(const re of deny){ if(re.test(s)) issues.push(`${f} ~ ${re}`); } }
if(issues.length){ console.error('[Sentinel] ❌', issues.slice(0,50)); process.exit(1); } console.log('[Sentinel] ✅ ok');
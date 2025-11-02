import fs from 'node:fs';
const tokens = JSON.parse(fs.readFileSync('./app/tokens/design-tokens.json','utf8'));
const req = ['colors','typography','radius']; const miss = req.filter(k => !(k in tokens));
const hex = x => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(x);
let errs=[]; if(miss.length) errs.push('Missing: '+miss.join(', '));
['primary','secondary','accent','surface','text'].forEach(k=>{ if(!tokens.colors?.[k]) errs.push('Missing color '+k); else if(!hex(tokens.colors[k])) errs.push('Non-hex color '+k+'='+tokens.colors[k]); });
if(!tokens.typography?.heading || !tokens.typography?.body) errs.push('Missing typography');
if(errs.length){ console.error('[Brand-Lock] ❌', errs); process.exit(1); } console.log('[Brand-Lock] ✅ tokens ok');
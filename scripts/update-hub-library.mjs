import fs from 'node:fs';

let s = fs.readFileSync('hub/hub.js', 'utf8');

const oldMap = `      $('#packets').innerHTML = list.map(function (s) {
        return '<button class="packet" type="button" data-key="' + s.key + '" style="--c:' + esc(s.canopy || '#6FA85A') + '">' +
          '<div class="top"></div>' +
          '<div class="packet-3d-box" aria-hidden="true">' + renderVolumetricTreeSvg(s, 112, 92) + '</div>' +
          '<b>' + esc(s.label) + '</b>' +
          '<i>' + esc(s.sciName || '') + '</i>' +
          '<div class="packet-tags">' +
            '<span class="cat">' + esc(s.category) + '</span>' +
            '<span class="packet-region-tag" title="' + esc(REGION_LABEL[(s.regions && s.regions[0]) || 'germany'] || '') + '">' + get3DCountryFlagSvg((s.regions && s.regions[0]) || 'germany', 18, 12) + ' <span>' + esc(REGION_LABEL[(s.regions && s.regions[0]) || 'germany'] || (s.regions && s.regions[0]) || 'germany') + '</span></span>' +
          '</div>' +
        '</button>';
      }).join('') || '<div class="empty" style="grid-column:1/-1">No plants match. Try a different word or clear a filter.</div>';`;

const newMap = `      $('#packets').innerHTML = list.map(function (s) {
        var isAlp = s.regions && s.regions.indexOf('alpenhof') >= 0;
        var isBase = s.regions && s.regions.indexOf('germany') >= 0;
        var sourceBadge = '';
        if (isAlp) {
          sourceBadge = '<span class="packet-source-tag alpenhof-tag">🏔️ Alpenhof</span>';
        } else if (isBase) {
          sourceBadge = '<span class="packet-source-tag base-farm-tag">🌱 Base Farm</span>';
        }
        return '<button class="packet" type="button" data-key="' + s.key + '" style="--c:' + esc(s.canopy || '#6FA85A') + '">' +
          '<div class="top"></div>' +
          '<div class="packet-3d-box" aria-hidden="true">' + renderVolumetricTreeSvg(s, 112, 92) + '</div>' +
          '<b>' + esc(s.label) + '</b>' +
          '<i>' + esc(s.sciName || '') + '</i>' +
          '<div class="packet-tags">' +
            '<span class="cat">' + esc(s.category) + '</span>' +
            sourceBadge +
            '<span class="packet-region-tag" title="' + esc(REGION_LABEL[(s.regions && s.regions[0]) || 'germany'] || '') + '">' + get3DCountryFlagSvg((s.regions && s.regions[0]) || 'germany', 18, 12) + ' <span>' + esc(REGION_LABEL[(s.regions && s.regions[0]) || 'germany'] || (s.regions && s.regions[0]) || 'germany') + '</span></span>' +
          '</div>' +
        '</button>';
      }).join('') || '<div class="empty" style="grid-column:1/-1">No plants match. Try a different word or clear a filter.</div>';`;

const oldDrawer = `    var regionTags = s.regions.map(function (r) {
      return '<span class="pill pill-flag">' + get3DCountryFlagSvg(r, 22, 15) + ' <span>' + esc(REGION_LABEL[r] || r) + '</span></span>';
    }).join('');
    openDrawer('<div class="species-3d-hero">' + renderVolumetricTreeSvg(s, 220, 160) + '</div>' +
      '<h2 id="drawerTitle"><span aria-hidden="true">' + s.icon + '</span> ' + esc(s.label) + '</h2>' +`;

const newDrawer = `    var isAlp = s.regions && s.regions.indexOf('alpenhof') >= 0;
    var isBase = s.regions && s.regions.indexOf('germany') >= 0;
    var sourceHeader = '';
    if (isAlp) {
      sourceHeader = '<div class="packet-source-pill alpenhof-pill">🏔️ Alpenhof Alpine Biome · Bavaria</div>';
    } else if (isBase) {
      sourceHeader = '<div class="packet-source-pill base-farm-pill">🌱 Base Farm · Central Europe</div>';
    }
    var regionTags = s.regions.map(function (r) {
      return '<span class="pill pill-flag">' + get3DCountryFlagSvg(r, 22, 15) + ' <span>' + esc(REGION_LABEL[r] || r) + '</span></span>';
    }).join('');
    openDrawer('<div class="species-3d-hero">' + renderVolumetricTreeSvg(s, 220, 160) + '</div>' +
      sourceHeader +
      '<h2 id="drawerTitle"><span aria-hidden="true">' + s.icon + '</span> ' + esc(s.label) + '</h2>' +`;

const norm = str => str.replace(/\r\n/g, '\n');
const hasOldMap = norm(s).includes(norm(oldMap));
const hasOldDrawer = norm(s).includes(norm(oldDrawer));
console.log('hasOldMap:', hasOldMap, 'hasOldDrawer:', hasOldDrawer);

if (hasOldMap && hasOldDrawer) {
  const isCRLF = s.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';
  const targetMap = oldMap.replace(/\r?\n/g, eol);
  const repMap = newMap.replace(/\r?\n/g, eol);
  const targetDrawer = oldDrawer.replace(/\r?\n/g, eol);
  const repDrawer = newDrawer.replace(/\r?\n/g, eol);
  
  s = s.replace(targetMap, () => repMap);
  s = s.replace(targetDrawer, () => repDrawer);
  fs.writeFileSync('hub/hub.js', s);
  console.log('Successfully updated hub/hub.js!');
} else {
  console.error('Failed to locate target strings.');
  process.exit(1);
}

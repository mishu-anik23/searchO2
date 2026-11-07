import fs from 'node:fs';

let css = fs.readFileSync('hub/hub.css', 'utf8');

// Update regional-bar-in, reg-options, reg-actions
const oldReg = `.regional-bar-in {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 16px;
  box-sizing: border-box;
}
.reg-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 0.82rem;
  color: #fce7b0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.pulse-beacon {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 10px #4ADE80;
  animation: beaconPulse 2s infinite ease-in-out;
  display: inline-block;
}
@keyframes beaconPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.7; }
}
.reg-options {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 2px 0;
  flex: 1;
}
.reg-options::-webkit-scrollbar {
  display: none;
}
.reg-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  text-decoration: none;
  color: #e2f5e8;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}`;

const newReg = `.regional-bar-in {
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  row-gap: 8px;
  column-gap: 12px;
  padding: 6px 16px;
  box-sizing: border-box;
}
.reg-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 0.82rem;
  color: #fce7b0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}
.pulse-beacon {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 10px #4ADE80;
  animation: beaconPulse 2s infinite ease-in-out;
  display: inline-block;
}
@keyframes beaconPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.7; }
}
.reg-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 8px;
  padding: 2px 0;
  flex: 1 1 auto;
  min-width: 0;
}
.reg-options::-webkit-scrollbar {
  display: none;
}
.reg-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  text-decoration: none;
  color: #e2f5e8;
  font-size: 0.82rem;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  flex-shrink: 0;
}`;

const oldActions = `.reg-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.reg-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #F0AC3D, #D97706);
  color: #182E20;
  padding: 6px 13px;
  border-radius: 10px;
  font-weight: 900;
  font-size: 0.84rem;
  text-decoration: none;
  box-shadow: 0 3px 0 #92400E;
  transition: transform 0.15s, filter 0.15s;
  white-space: nowrap;
}`;

const newActions = `.reg-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}
.reg-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #F0AC3D, #D97706);
  color: #182E20;
  padding: 6px 13px;
  border-radius: 10px;
  font-weight: 900;
  font-size: 0.84rem;
  text-decoration: none;
  box-shadow: 0 3px 0 #92400E;
  transition: transform 0.15s, filter 0.15s;
  white-space: nowrap;
}`;

const additionalSourceTagStyles = `
/* Botanical Source Tags for Library Cards & Drawer */
.packet-source-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.alpenhof-tag {
  background: linear-gradient(135deg, #0284C7, #0369A1);
  color: #F0F9FF;
  border: 1px solid rgba(186, 230, 253, 0.45);
  box-shadow: 0 1px 4px rgba(2, 132, 199, 0.25);
}
.base-farm-tag {
  background: linear-gradient(135deg, #15803D, #166534);
  color: #DCFCE7;
  border: 1px solid rgba(187, 247, 208, 0.45);
  box-shadow: 0 1px 4px rgba(21, 128, 61, 0.25);
}
.packet-source-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}
.alpenhof-pill {
  background: linear-gradient(135deg, #0284C7, #0369A1);
  color: #FFFFFF;
  border: 1px solid rgba(186, 230, 253, 0.6);
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}
.base-farm-pill {
  background: linear-gradient(135deg, #15803D, #166534);
  color: #FFFFFF;
  border: 1px solid rgba(187, 247, 208, 0.6);
  box-shadow: 0 2px 8px rgba(21, 128, 61, 0.3);
}
`;

const norm = s => s.replace(/\r\n/g, '\n');
const isCRLF = css.includes('\r\n');
const eol = isCRLF ? '\r\n' : '\n';

if (norm(css).includes(norm(oldReg))) {
  css = css.replace(oldReg.replace(/\r?\n/g, eol), () => newReg.replace(/\r?\n/g, eol));
}
if (norm(css).includes(norm(oldActions))) {
  css = css.replace(oldActions.replace(/\r?\n/g, eol), () => newActions.replace(/\r?\n/g, eol));
}

if (!css.includes('.packet-source-tag')) {
  css += additionalSourceTagStyles.replace(/\r?\n/g, eol);
}

fs.writeFileSync('hub/hub.css', css);
fs.writeFileSync('public/hub/hub.css', css);
console.log('Successfully updated hub/hub.css and public/hub/hub.css!');

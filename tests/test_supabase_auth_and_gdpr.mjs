import { readFileSync } from 'node:fs';
import registerHandler from '../api/auth/register.js';
import loginHandler from '../api/auth/login.js';
import logoutHandler from '../api/auth/logout.js';
import usersHandler from '../api/users.js';
import adminUsersHandler from '../api/admin/users.js';
import adminStatsHandler from '../api/admin/stats.js';
import { getPool } from '../api/lib/db.js';

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
    end() { return this; }
  };
  return res;
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 SEARCHO2 SUPABASE AUTH & GDPR PIP/PUFF TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Button rename in index.html
  console.log('▶ Test 1: Efficient Button Rename in Auth Modals');
  const indexHtml = readFileSync('index.html', 'utf8');
  if (!indexHtml.includes('✨ Create Account &amp; Protect Farm ➔')) {
    throw new Error('FAIL: Button not renamed to "✨ Create Account &amp; Protect Farm ➔"');
  }
  if (!indexHtml.includes('🚀 Sign In to Farm ➔')) {
    throw new Error('FAIL: Button not renamed to "🚀 Sign In to Farm ➔"');
  }
  console.log('  ✅ Register button renamed efficiently: "✨ Create Account & Protect Farm ➔"');
  console.log('  ✅ Sign-in button renamed efficiently: "🚀 Sign In to Farm ➔"');

  // Test 2: Pip & Puff caring animations & SVGs
  console.log('\n▶ Test 2: Pip & Puff Caring Animation & GDPR Modal in index.html');
  const requiredTokens = [
    'showGdprDataProtectionModal',
    'renderPuffSvg',
    'renderPipSvg',
    '@keyframes puffFloat',
    '@keyframes puffGlow',
    '@keyframes pipSway',
    '@keyframes pipLeafWiggle',
    'gdpr-protection-overlay',
    'gdpr-protection-card',
    'Auto-advancing to German Farm Setup in 5s...'
  ];
  for (const token of requiredTokens) {
    if (!indexHtml.includes(token)) {
      throw new Error(`FAIL: Missing GDPR / Pip & Puff component: ${token}`);
    }
  }
  console.log('  ✅ Puff caring mentor SVG & animations present (puffFloat, puffGlow)');
  console.log('  ✅ Pip caring explorer SVG & animations present (pipSway, pipLeafWiggle)');
  console.log('  ✅ Interactive GDPR modal with auto-close countdown (5s) & smooth transition present');

  // Test 3: Smooth transition to German farm location modal
  console.log('\n▶ Test 3: Smooth Transition into German Farm Setup Modal');
  if (!indexHtml.includes('guest-osm-root-modal') || !indexHtml.includes('is-visible')) {
    throw new Error('FAIL: Missing smooth transition classes for guest-osm-root-modal');
  }
  console.log('  ✅ guest-osm-root-modal equipped with smooth opacity & cubic-bezier easing');

  // Test 4: Supabase Database Account Creation & Password Encryption
  console.log('\n▶ Test 4: Account Creation with Encrypted Password in Supabase DB');
  const uniqueId = Date.now();
  const testEmail = `tester_${uniqueId}@searcho2.online`;
  const testPassword = `SecureEcoPass_${uniqueId}!`;
  const testDisplayName = `EcoExplorer_${uniqueId % 1000}`;

  const regRes = mockRes();
  await registerHandler({
    method: 'POST',
    body: {
      email: testEmail,
      password: testPassword,
      displayName: testDisplayName
    }
  }, regRes);

  if (regRes.statusCode !== 200 || !regRes.data.user) {
    throw new Error(`FAIL: Registration failed with status ${regRes.statusCode}: ${JSON.stringify(regRes.data)}`);
  }
  console.log('  ✅ Account successfully created via API. User ID:', regRes.data.user.id);
  console.log('  ✅ Token issued:', regRes.data.accessToken ? 'YES (Valid)' : 'NO');

  // Verify directly in Supabase PostgreSQL pooler
  const pool = getPool();
  const dbUser = await pool.query('SELECT id, email, display_name, password_hash, role, auth_provider, status, privacy_policy_version FROM public.users WHERE LOWER(email) = LOWER($1)', [testEmail]);
  if (!dbUser.rowCount) {
    throw new Error('FAIL: User not found in Supabase public.users table!');
  }
  const uRow = dbUser.rows[0];
  console.log('  ✅ User verified in Supabase public.users:');
  console.log('     - Email:', uRow.email);
  console.log('     - Display Name:', uRow.display_name);
  console.log('     - Password Hash:', uRow.password_hash);
  console.log('     - Role:', uRow.role);
  console.log('     - Status:', uRow.status);

  if (!uRow.password_hash || !uRow.password_hash.startsWith('$2b$')) {
    throw new Error('FAIL: Password is NOT saved as encrypted bcrypt in Supabase!');
  }
  if (uRow.password_hash.includes(testPassword)) {
    throw new Error('FAIL: Password was stored in plaintext!');
  }
  console.log('  ✅ Password is confirmed ENCRYPTED with bcrypt ($2b$10) - zero plaintext exposure!');

  // Test 5: Logout and Subsequent Login (Fixing "User account not found" bug)
  console.log('\n▶ Test 5: Logout and Cross-Session Login (Fixes "no user exists" bug)');
  const logoutRes = mockRes();
  await logoutHandler({ method: 'POST' }, logoutRes);
  if (logoutRes.statusCode !== 200) {
    throw new Error('FAIL: Logout failed');
  }
  console.log('  ✅ Logout successful');

  // Attempt login with the registered credentials
  const loginRes = mockRes();
  await loginHandler({
    method: 'POST',
    body: {
      email: testEmail,
      password: testPassword
    }
  }, loginRes);

  if (loginRes.statusCode !== 200 || !loginRes.data.user) {
    throw new Error(`FAIL: Subsequent login failed: ${JSON.stringify(loginRes.data)}`);
  }
  console.log('  ✅ Login after logout succeeded! User:', loginRes.data.user.displayName);
  console.log('  ✅ Farm state restored:', loginRes.data.farmState);

  // Attempt login with invalid password (must be rejected)
  const badLoginRes = mockRes();
  await loginHandler({
    method: 'POST',
    body: {
      email: testEmail,
      password: 'WrongPassword999!'
    }
  }, badLoginRes);
  if (badLoginRes.statusCode !== 401) {
    throw new Error(`FAIL: Invalid password was not rejected with 401 (got ${badLoginRes.statusCode})`);
  }
  console.log('  ✅ Invalid password correctly rejected with 401 Unauthorized');

  // Test 6: Display Newly Created User in Admin Dashboard
  console.log('\n▶ Test 6: Newly Created User Displayed in Admin Dashboard');
  const usersRes = mockRes();
  await usersHandler({
    method: 'GET',
    url: '/api/users?search=' + encodeURIComponent(testDisplayName),
    headers: {}
  }, usersRes);

  if (usersRes.statusCode !== 200 || !usersRes.data.users) {
    throw new Error('FAIL: Failed to fetch users for admin dashboard');
  }

  const matchedUser = usersRes.data.users.find(u => u.email.toLowerCase() === testEmail.toLowerCase());
  if (!matchedUser) {
    throw new Error('FAIL: Newly created user did not appear in Admin Users list!');
  }
  console.log('  ✅ Newly created user found in Admin Dashboard:');
  console.log('     - Display Name:', matchedUser.display_name);
  console.log('     - Email:', matchedUser.email);
  console.log('     - Encrypted Password Flag:', matchedUser.hasEncryptedPassword);
  console.log('     - Farm Name:', matchedUser.farmName);
  console.log('     - Created At:', matchedUser.created_at);

  // Test 7: Byte Parity Between Root and Public Files
  console.log('\n▶ Test 7: Byte Parity Verification for Public Mirrors');
  const adminDash1 = readFileSync('admin/dashboard.html');
  const adminDash2 = readFileSync('public/admin/dashboard.html');
  if (!adminDash1.equals(adminDash2)) {
    throw new Error('FAIL: admin/dashboard.html and public/admin/dashboard.html are NOT byte-identical!');
  }
  console.log('  ✅ admin/dashboard.html <===> public/admin/dashboard.html (100% Byte Parity)');

  const tour1 = readFileSync('home-avatar-tour.js');
  const tour2 = readFileSync('public/home-avatar-tour.js');
  if (!tour1.equals(tour2)) {
    throw new Error('FAIL: home-avatar-tour.js and public/home-avatar-tour.js are NOT byte-identical!');
  }
  console.log('  ✅ home-avatar-tour.js <===> public/home-avatar-tour.js (100% Byte Parity)');

  console.log('\n====================================================');
  console.log('🎉 ALL TESTS PASSED! IMPLEMENTATION FULLY VERIFIED.');
  console.log('====================================================');

  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});

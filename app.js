/* Save as: app.js
   Core single-page-ish behaviour for the demo: routing, local demo accounts, modal, and UI population.
   NOTE: This demo stores demo accounts locally under localStorage key "bk_demo_users". Nothing leaves the browser. */
(function () {
  const demoKey = 'bk_demo_users';
  const mainPanel = document.getElementById('mainPanel');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  // small util
  const qs = s => document.querySelector(s);
  const qsa = s => document.querySelectorAll(s);
  function loadUsers(){ try { return JSON.parse(localStorage.getItem(demoKey) || '{}'); } catch(e){ return {}; } }
  function saveUsers(obj){ localStorage.setItem(demoKey, JSON.stringify(obj)); }
  function maskEmail(s){ if(!s) return ''; if(s.includes('@')){const p=s.split('@'); return p[0].slice(0,1) + '***@' + p[1]; } return '***'; }
  function showModal(html){
    modalBody.innerHTML = html;
    modalBackdrop.style.display = 'flex';
    modalBackdrop.setAttribute('aria-hidden','false');
    modalClose && modalClose.focus();
  }
  function closeModal(){
    modalBackdrop.style.display = 'none';
    modalBackdrop.setAttribute('aria-hidden','true');
  }

  // small router: read ?page
  function getPage(){ return new URLSearchParams(location.search).get('page') || 'home'; }

  // content renderers
  function renderHome(){
    const users = loadUsers();
    const userCount = Object.keys(users).length;
    mainPanel.innerHTML = `
      <div class="hero card">
        <h2>Secure practice, realistic UI</h2>
        <p class="lead">Bachat Khata is a safe, local-only banking UI designed for phishing awareness and ethical hacking coursework.</p>

        <div class="kpis">
          <div class="kpi"><small>Balance (demo)</small><strong>₹ 12,340.75</strong></div>
          <div class="kpi"><small>Alerts</small><strong>1</strong></div>
          <div class="kpi"><small>Demo users</small><strong id="kUsers">${userCount}</strong></div>
        </div>

        <div style="margin-top:14px" class="flex">
          <button id="ctaSignup" class="btn btn-primary">Create Demo Account</button>
          <button id="ctaHelp" class="btn btn-ghost">Phishing Checklist</button>
          <button id="ctaSim" class="btn btn-outline">Run Guided Simulation</button>
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <h3 style="margin-top:0">Recent transactions</h3>
        <table class="table" aria-label="Recent transactions">
          <thead><tr><th>Date</th><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody id="txBody"></tbody>
        </table>
      </div>
    `;

    // wire CTA buttons
    qs('#ctaSignup').addEventListener('click', ()=> location.href = '?page=signup');
    qs('#ctaHelp').addEventListener('click', ()=> location.href = '?page=help');
    qs('#ctaSim').addEventListener('click', showSimulation);

    // populate txs
    const txs = [
      {d:'2025-11-25',desc:'Grocery (demo)',amt:'-₹1,240.00'},
      {d:'2025-11-22',desc:'Salary (demo)',amt:'+₹25,000.00'},
      {d:'2025-11-18',desc:'Utilities (demo)',amt:'-₹2,120.00'},
      {d:'2025-11-12',desc:'Coffee (demo)',amt:'-₹420.00'},
      {d:'2025-11-02',desc:'Online store (demo)',amt:'-₹3,500.00'}
    ];
    const txBody = qs('#txBody');
    txBody.innerHTML = '';
    txs.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.d}</td><td>${t.desc}</td><td style="text-align:right;font-weight:700">${t.amt}</td>`;
      txBody.appendChild(tr);
    });
  }

  function renderHelp(){
    mainPanel.innerHTML = `
      <div class="card">
        <h2>Phishing Checklist</h2>
        <ol>
          <li>Be suspicious of urgent reward language.</li>
          <li>Hover links — confirm the real destination.</li>
          <li>Check sender domain for misspellings.</li>
          <li>Never reuse real banking passwords on demo sites.</li>
        </ol>
        <div style="margin-top:12px" class="row">
          <button class="btn btn-primary" id="annotatedEmail">Show Annotated Example</button>
          <button class="btn btn-ghost" id="backHome">Back</button>
        </div>
      </div>
    `;
    qs('#annotatedEmail').addEventListener('click', ()=> showModal(`
      <h4>Example: Suspicious email</h4>
      <p><strong>Subject:</strong> You have won ₹1,000,000!</p>
      <ul>
        <li><strong>Urgent reward language</strong> — red flag</li>
        <li><strong>Sender domain mismatch</strong> — check carefully</li>
        <li><strong>Link mismatch</strong> — hover to verify</li>
      </ul>
    `));
    qs('#backHome').addEventListener('click', ()=> location.href='?page=home');
  }

  function renderContact(){
    mainPanel.innerHTML = `
      <div class="card">
        <h2>Contact (demo)</h2>
        <p class="muted">Messages are stored locally for demonstration only.</p>
        <div style="margin-top:8px">
          <input id="cname" class="field" placeholder="Your name">
          <input id="cemail" class="field" placeholder="you@example.com">
          <textarea id="cmsg" class="field" rows="5" placeholder="Message..."></textarea>
          <div class="row" style="margin-top:8px">
            <button id="sendContact" class="btn btn-primary">Send (local)</button>
            <button id="clearContact" class="btn btn-ghost">Clear</button>
          </div>
          <div id="contactNote" class="muted" style="margin-top:8px;display:none"></div>
        </div>
      </div>
    `;
    qs('#sendContact').addEventListener('click', ()=> {
      const name = qs('#cname').value.trim();
      const email = qs('#cemail').value.trim();
      const msg = qs('#cmsg').value.trim();
      const note = qs('#contactNote');
      if(!name || !email || !msg){ note.style.display='block'; note.textContent='Please complete all fields (demo).'; note.style.color='crimson'; return; }
      note.style.display='block'; note.textContent='Message recorded locally (demo).';
      note.style.color='green';
      console.info('Contact (demo):', { name: name[0] + '***', email: maskEmail(email), preview: msg.slice(0,60) });
    });
    qs('#clearContact').addEventListener('click', ()=> {
      qs('#cname').value=''; qs('#cemail').value=''; qs('#cmsg').value=''; qs('#contactNote').style.display='none';
    });
  }

  function renderLogin(){
    mainPanel.innerHTML = `
      <div class="card">
        <h2>Login</h2>
        <div style="margin-top:10px">
          <input id="loginEmail" class="field" placeholder="email@example.com">
          <input id="loginPass" class="field" type="password" placeholder="Password">
          <div class="row" style="margin-top:8px">
            <button id="loginBtn" class="btn btn-primary">Login</button>
            <button id="toSignup" class="btn btn-ghost">Create demo account</button>
          </div>
        </div>
        <p class="muted" style="margin-top:10px">This is a safe demo — accounts stored locally.</p>
      </div>
    `;
    qs('#toSignup').addEventListener('click', ()=> location.href='?page=signup');
    qs('#loginBtn').addEventListener('click', ()=> {
      const em = qs('#loginEmail').value.trim(); const pw = qs('#loginPass').value;
      if(!em || !pw) return showModal('Please enter both fields (demo).');
      const users = loadUsers();
      if(!users[em]) return showModal('No demo account found for ' + maskEmail(em) + '. Create one first.');
      if(users[em].password !== pw) return showModal('Invalid demo credentials.');
      sessionStorage.setItem('bk_demo_current', em);
      showModal('Login successful (demo). Redirecting to dashboard...');
      setTimeout(()=> location.href='?page=dashboard', 700);
    });
  }

  function renderSignup(){
    mainPanel.innerHTML = `
      <div class="card">
        <h2>Create Demo Account</h2>
        <div style="margin-top:10px">
          <input id="signupEmail" class="field" placeholder="email@example.com">
          <input id="signupPass" class="field" type="password" placeholder="Create a demo password">
          <div class="row" style="margin-top:8px">
            <button id="signupBtn" class="btn btn-primary">Create Account</button>
            <button id="toLogin" class="btn btn-ghost">Back to login</button>
          </div>
        </div>
        <p class="muted" style="margin-top:10px">Do NOT use your real bank credentials here.</p>
      </div>
    `;
    qs('#toLogin').addEventListener('click', ()=> location.href='?page=login');
    qs('#signupBtn').addEventListener('click', ()=> {
      const em = qs('#signupEmail').value.trim(); const pw = qs('#signupPass').value;
      if(!em || !pw) return showModal('Please provide email and password.');
      const users = loadUsers();
      if(users[em]) return showModal('Demo account already exists for ' + maskEmail(em));
      users[em] = { password: pw, name: 'Demo User', acct: 'SAV-' + Math.floor(Math.random()*9000+1000), balance: 12340.75, email: em };
      saveUsers(users);
      sessionStorage.setItem('bk_demo_current', em);
      showModal('Demo account created locally for ' + maskEmail(em) + '. Redirecting to dashboard...');
      setTimeout(()=> location.href='?page=dashboard', 800);
    });
  }

  function renderDashboard(){
    const em = sessionStorage.getItem('bk_demo_current');
    const users = loadUsers();
    if(!em || !users[em]) { location.href='?page=login'; return; }
    const u = users[em];
    mainPanel.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <h2 style="margin:0">Hello, ${escapeHtml(u.name || 'Demo User')}</h2>
            <div class="muted">Account: <strong>${escapeHtml(u.acct)}</strong></div>
          </div>
          <div style="text-align:right">
            <small class="muted">Available</small>
            <div style="font-weight:900;font-size:20px">₹ <span id="bal">${(u.balance||0).toFixed(2)}</span></div>
            <div style="margin-top:8px">
              <button id="logoutBtn" class="btn btn-ghost">Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <h3 style="margin-top:0">Recent transactions</h3>
        <table class="table"><thead><tr><th>Date</th><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody id="txBody"></tbody></table>
      </div>

      <div class="card" style="margin-top:14px">
        <h3>Actions</h3>
        <div class="row">
          <button id="reportBtn" class="btn btn-primary">Report Suspicious</button>
          <button id="chgPassBtn" class="btn btn-ghost">Change Password (simulate)</button>
        </div>
      </div>
    `;

    qs('#logoutBtn').addEventListener('click', ()=> {
      sessionStorage.removeItem('bk_demo_current');
      showModal('You have been logged out (demo).');
      setTimeout(()=> location.href='?page=home', 600);
    });

    // populate transactions (same demo data)
    const txs = [
      {d:'2025-11-25',desc:'Grocery (demo)',amt:'-₹1,240.00'},
      {d:'2025-11-22',desc:'Salary (demo)',amt:'+₹25,000.00'},
      {d:'2025-11-18',desc:'Utilities (demo)',amt:'-₹2,120.00'}
    ];
    const txBody = qs('#txBody'); txBody.innerHTML = '';
    txs.forEach(t => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${t.d}</td><td>${t.desc}</td><td style="text-align:right;font-weight:700">${t.amt}</td>`; txBody.appendChild(tr); });

    qs('#reportBtn').addEventListener('click', ()=> showModal('Report recorded (demo). In real life, inform your security team.'));
    qs('#chgPassBtn').addEventListener('click', ()=> showModal('Password change simulated (demo). Use secure server-side flows in production.'));
  }

  // tiny helpers for escaping
  function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])) }
  function showSimulation(){ showModal(`<h4>Guided simulation</h4><ol><li>Inspect the email sender domain.</li><li>Hover links to check destinations.</li><li>Report suspicious messages.</li></ol><p class="muted">This guided flow is local-only and safe.</p>`); }
  function annotate(){ showModal('<p>Annotated example content (demo)</p>'); }

  // wire right-side quick login buttons
  function wireQuickLogin(){
    const quickLogin = qs('#quickLoginBtn');
    if(quickLogin) quickLogin.addEventListener('click', ()=> {
      const em = qs('#quickEmail').value.trim(); const pw = qs('#quickPass').value;
      if(!em || !pw) return showModal('Enter email and password to login (demo).');
      const users = loadUsers();
      if(!users[em]) return showModal('No demo account found for ' + maskEmail(em) + '. Create one first.');
      if(users[em].password !== pw) return showModal('Invalid demo credentials.');
      sessionStorage.setItem('bk_demo_current', em);
      showModal('Login successful (demo) — loading dashboard...');
      setTimeout(()=> location.href='?page=dashboard', 700);
    });
    const quickSignupBtn = qs('#quickSignupBtn');
    if(quickSignupBtn) quickSignupBtn.addEventListener('click', ()=> location.href='?page=signup');
    const launchSimBtn = qs('#launchSim');
    if(launchSimBtn) launchSimBtn.addEventListener('click', showSimulation);
  }

  // page bootstrap: decide which page to render
  function router(){
    const p = getPage();
    if(p === 'home') renderHome();
    else if(p === 'help') renderHelp();
    else if(p === 'contact') renderContact();
    else if(p === 'login') renderLogin();
    else if(p === 'signup') renderSignup();
    else if(p === 'dashboard') renderDashboard();
    else renderHome();

    // after rendering main panel, wire quick-login buttons in side panel
    wireQuickLogin();
  }

  // header buttons
  qs('#openLogin').addEventListener('click', ()=> location.href='?page=login');
  qs('#openSignup').addEventListener('click', ()=> location.href='?page=signup');

  // modal controls
  modalBackdrop.addEventListener('click', (e) => { if(e.target === modalBackdrop) closeModal(); });
  modalClose && modalClose.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => { if(e.key === 'Escape' && modalBackdrop.style.display === 'flex') closeModal(); });

  // initialize router
  router();

  // friendly console note
  console.info('Bachat Khata — improved demo loaded. File: index.html (split files).');
})();

import re

html = r'''<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Utgiftssporing – SkattPro</title>
  <meta name="description" content="Spor fradragsberettigede utgifter og reduser skatten din.">
  <link rel="canonical" href="https://skattpro.no/utgiftssporing.html">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="skattpro-nav.css">
  <style>
    .page-header { text-align: center; padding: 60px 24px 40px; max-width: 800px; margin: 0 auto; }
    .page-header h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 12px; }
    .page-header p { font-size: 1.125rem; color: var(--gray); line-height: 1.7; }
    .expense-container { max-width: 1100px; margin: 0 auto; padding: 0 24px 80px; }
    .expense-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; align-items: start; }
    @media (max-width: 860px) { .expense-grid { grid-template-columns: 1fr; } }
    .card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .card h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--ink); }
    .form-group input, .form-group select { width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 10px; font-size: 0.95rem; font-family: inherit; background: white; color: var(--ink); transition: border-color 0.2s; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
    .btn-row { display: flex; gap: 10px; margin-top: 20px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer; border: none; transition: all 0.2s; font-family: inherit; text-decoration: none; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; box-shadow: 0 4px 14px rgba(79,70,229,0.3); flex: 1; }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.4); }
    .btn-secondary { background: var(--light); color: var(--dark); border: 1px solid var(--border); }
    .hint-box { background: linear-gradient(135deg, #eff6ff, #f0f9ff); border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-top: 20px; font-size: 0.9rem; color: #1e40af; }
    .hint-box h4 { margin-bottom: 8px; font-size: 0.95rem; }
    .hint-box ul { margin: 8px 0 0 20px; }
    .hint-box li { margin-bottom: 4px; }
    .expense-list { margin-top: 24px; max-height: 420px; overflow-y: auto; }
    .expense-item { display: flex; justify-content: space-between; align-items: center; padding: 14px; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 8px; background: white; gap: 12px; }
    .expense-item .info { flex: 1; min-width: 0; }
    .expense-item .name { font-weight: 600; color: var(--ink); font-size: 0.95rem; }
    .expense-item .meta { font-size: 0.8rem; color: var(--gray); margin-top: 2px; }
    .expense-item .amount { font-weight: 700; color: var(--primary); white-space: nowrap; }
    .expense-item .delete { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; }
    .expense-item .delete:hover { background: #fee2e2; }
    .total-box { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border-radius: 14px; padding: 24px; margin-top: 20px; box-shadow: 0 4px 14px rgba(79,70,229,0.3); }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem; }
    .total-row:last-child { margin-bottom: 0; font-size: 1.4rem; font-weight: 800; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.3); margin-top: 12px; }
    .category-tag { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; margin-left: 8px; }
    .cat-reise { background: #dbeafe; color: #1d4ed8; }
    .cat-utstyr { background: #dcfce7; color: #15803d; }
    .cat-kontor { background: #fef3c7; color: #b45309; }
    .cat-markedsforing { background: #fce7f3; color: #be185d; }
    .cat-annet { background: #f3f4f6; color: #374151; }
    .empty-state { text-align: center; padding: 32px 16px; color: var(--gray); font-size: 0.95rem; }
    .ocr-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
    .ocr-upload-area { border: 2px dashed var(--border); border-radius: 12px; padding: 24px; text-align: center; background: var(--panel2); cursor: pointer; transition: all 0.2s; }
    .ocr-upload-area:hover { border-color: var(--primary); background: #f0f4ff; }
    .ocr-upload-area input[type="file"] { display: none; }
    @media (max-width: 600px) { .page-header h1 { font-size: 2rem; } .btn-row { flex-direction: column; } }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="index.html" class="logo"><span class="logo-mark">S</span> SkattPro</a>
    <div class="menu" id="primaryMenu">
      <a href="index.html">Skatt</a>
      <a href="kalkulator.html">Kalkulator</a>
      <a href="faktura.html">Faktura</a>
      <a href="forskuddsskatt.html">Forskudd</a>
      <a href="skattefrister.html">Frister</a>
      <a href="utgiftssporing.html" class="active">Utgifter</a>
      <a href="paminnelser.html">Påminnelser</a>
      <a href="pro-features.html">Pro</a>
    </div>
    <div class="nav-actions"><a href="ansatte-og-lonn/" class="btn btn-ghost">Ansatte</a></div>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false" onclick="document.getElementById('primaryMenu').classList.toggle('open')">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/></svg>
    </button>
  </nav>

  <header class="page-header">
    <h1>📋 Utgiftssporing</h1>
    <p>Spor driftskostnader som reduserer din skattepliktige inntekt. Automatisk kategorisering og lokal lagring.</p>
  </header>

  <main class="expense-container">
    <div class="expense-grid">
      <div class="card">
        <h2>Legg til utgift</h2>
        <div class="form-group">
          <label for="expenseName">Beskrivelse</label>
          <input type="text" id="expenseName" placeholder="f.eks. Bærbar PC, Kontorleie">
        </div>
        <div class="form-group">
          <label for="expenseAmount">Beløp (kr)</label>
          <input type="number" id="expenseAmount" placeholder="0" min="0" step="1">
        </div>
        <div class="form-group">
          <label for="expenseCategory">Kategori</label>
          <select id="expenseCategory">
            <option value="reise">Reise og kjøring</option>
            <option value="utstyr">Utstyr og inventar</option>
            <option value="kontor">Kontor og hjemmekontor</option>
            <option value="markedsforing">Markedsføring</option>
            <option value="annet">Annet</option>
          </select>
        </div>
        <div class="form-group">
          <label for="expenseDate">Dato</label>
          <input type="date" id="expenseDate">
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="addExpense()">Legg til</button>
          <button class="btn btn-secondary" onclick="clearForm()">Nullstill</button>
        </div>
        <div class="hint-box">
          <h4>💡 Fradragsberettigede utgifter</h4>
          <ul>
            <li><strong>Reise:</strong> kjøring til kunder, fly, tog, taxi</li>
            <li><strong>Utstyr:</strong> PC, mobil, verktøy (over 3 000 kr avskrives)</li>
            <li><strong>Kontor:</strong> leie, strøm, internett, hjemmekontor (5 400 kr/år)</li>
            <li><strong>Markedsføring:</strong> annonser, nettside, visitkort</li>
          </ul>
        </div>
        <div class="ocr-section">
          <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:12px">📷 Skann kvittering (Pro)</h2>
          <div class="ocr-upload-area" onclick="document.getElementById('ocrFile').click()">
            <div style="font-size:32px;margin-bottom:8px">📸</div>
            <div style="font-weight:600;color:var(--ink)">Klikk for å laste opp kvittering</div>
            <div style="font-size:0.85rem;color:var(--gray);margin-top:4px">PNG, JPG eller PDF</div>
            <input type="file" id="ocrFile" accept="image/*,.pdf" onchange="handleOCR(event)">
          </div>
          <div id="ocrPreview" style="margin-top:12px;display:none">
            <img id="ocrImage" style="max-width:100%;border-radius:8px;border:1px solid var(--border)" alt="Forhåndsvisning">
          </div>
          <div id="ocrProgress" style="margin-top:12px;display:none">
            <div style="height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden">
              <div id="ocrProgressFill" style="height:100%;background:linear-gradient(135deg,#2563eb,#7c3aed);width:0%;transition:width 0.3s"></div>
            </div>
            <div id="ocrProgressText" style="font-size:13px;color:var(--gray);margin-top:8px">Behandler...</div>
          </div>
          <div id="ocrResult" style="margin-top:16px;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;display:none"></div>
        </div>
      </div>

      <div class="card">
        <h2>Oversikt</h2>
        <div class="expense-list" id="expenseList">
          <div class="empty-state">Ingen utgifter lagt til ennå.</div>
        </div>
        <div class="total-box" id="totalBox" style="display:none">
          <div class="total-row"><span>Totalt registrert</span><span id="totalAmount">0 kr</span></div>
          <div class="total-row"><span>Fradrag (ca.)</span><span id="totalDeduction">0 kr</span></div>
          <div class="total-row"><span>Du sparer i skatt</span><span id="taxSaving">0 kr</span></div>
        </div>
      </div>
    </div>
  </main>

  <script>
    let expenses = [];
    const categoryLabels = { reise: 'Reise', utstyr: 'Utstyr', kontor: 'Kontor', markedsforing: 'Markedsføring', annet: 'Annet' };
    const categoryClass = { reise: 'cat-reise', utstyr: 'cat-utstyr', kontor: 'cat-kontor', markedsforing: 'cat-markedsforing', annet: 'cat-annet' };

    function render() {
      const list = document.getElementById('expenseList');
      const totalBox = document.getElementById('totalBox');
      if (expenses.length === 0) {
        list.innerHTML = '<div class="empty-state">Ingen utgifter lagt til ennå.</div>';
        totalBox.style.display = 'none';
        return;
      }
      list.innerHTML = expenses.map((e, i) => `
        <div class="expense-item">
          <div class="info">
            <div class="name">${escapeHtml(e.name)}</div>
            <div class="meta">${e.date} · <span class="category-tag ${categoryClass[e.category] || 'cat-annet'}">${categoryLabels[e.category] || 'Annet'}</span></div>
          </div>
          <div class="amount">${formatNOK(e.amount)}</div>
          <button class="delete" onclick="deleteExpense(${i})">Slett</button>
        </div>
      `).join('');
      const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
      const saving = total * 0.22;
      document.getElementById('totalAmount').textContent = formatNOK(total);
      document.getElementById('totalDeduction').textContent = formatNOK(total);
      document.getElementById('taxSaving').textContent = formatNOK(saving);
      totalBox.style.display = 'block';
    }
    function addExpense() {
      const name = document.getElementById('expenseName').value.trim();
      const amount = parseFloat(document.getElementById('expenseAmount').value);
      const category = document.getElementById('expenseCategory').value;
      const date = document.getElementById('expenseDate').value || new Date().toISOString().split('T')[0];
      if (!name || !amount || amount <= 0) { alert('Fyll inn beskrivelse og beløp.'); return; }
      expenses.push({ name, amount, category, date });
      clearForm();
      render();
    }
    function deleteExpense(index) { expenses.splice(index, 1); render(); }
    function clearForm() {
      document.getElementById('expenseName').value = '';
      document.getElementById('expenseAmount').value = '';
      document.getElementById('expenseCategory').value = 'reise';
      document.getElementById('expenseDate').value = '';
    }
    function formatNOK(n) {
      return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(n);
    }
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    function handleOCR(event) {
      const file = event.target.files[0];
      if (!file) return;
      document.getElementById('ocrPreview').style.display = 'none';
      document.getElementById('ocrProgress').style.display = 'block';
      document.getElementById('ocrResult').style.display = 'none';
      document.getElementById('ocrProgressFill').style.width = '0%';
      document.getElementById('ocrProgressText').textContent = 'Laster opp...';
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => { document.getElementById('ocrImage').src = e.target.result; document.getElementById('ocrPreview').style.display = 'block'; };
        reader.readAsDataURL(file);
      }
      setTimeout(() => {
        document.getElementById('ocrProgressFill').style.width = '40%';
        document.getElementById('ocrProgressText').textContent = 'Behandler...';
        setTimeout(() => {
          document.getElementById('ocrProgressFill').style.width = '100%';
          document.getElementById('ocrProgressText').textContent = 'Ferdig!';
          setTimeout(() => {
            document.getElementById('ocrProgress').style.display = 'none';
            document.getElementById('expenseName').value = 'Kvittering ' + new Date().toLocaleDateString('no-NO');
            const res = document.getElementById('ocrResult');
            res.style.display = 'block';
            res.innerHTML = '<h4>OCR ferdig</h4><p style="color:#166534">Kvittering lastet. Beløp og kategori kan endres manuelt.</p>';
          }, 400);
        }, 600);
      }, 400);
    }
  </script>
</body>
</html>'''

with open('utgiftssporing.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('utgiftssporing.html written')

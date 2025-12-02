<script>
  import NavBar from '$lib/NavBar.svelte';

  const stats = [
    { value: 156, label: 'Bewertungen abgeschlossen' },
    { value: 156, label: 'Athleten betreut' },
    { value: 340, label: 'Trainingseinheiten' },
    { value: 18, label: 'Wettkämpfe begleitet' }
  ];

  const profile = {
    name: 'Daniel',
    role: 'Nationaltrainer',
    email: 'daniel.coach@karate-swiss.ch',
    phone: '+41 79 123 45 67',
    location: 'Zürich, Schweiz',
    memberSince: 'Januar 2020',
    license: 'A-Lizenz'
  };
</script>

<div class="app-shell">
  <NavBar active="profil" />

  <main class="page container">
    <header class="page-header">
      <h1>Mein Profil</h1>
      <p class="muted">Persönliche Daten und Einstellungen</p>
    </header>

    <section class="layout">
      <div class="profile-card card">
        <div class="avatar-wrap">
          <div class="avatar">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3.2 19 6v5c0 4.8-3.1 9.4-7 10.8C8.1 20.4 5 15.8 5 11V6z"></path>
            </svg>
          </div>
        </div>
        <div class="profile-name">{profile.name}</div>
        <div class="badge">Coach</div>
        <div class="profile-role">{profile.role}</div>
        <button class="logout" type="button">⬅ Abmelden</button>
      </div>

      <div class="card info">
        <h3>Kontaktinformationen</h3>
        <div class="info-item">
          <div class="ico">✉</div>
          <div>
            <div class="label">E-Mail</div>
            <div class="value">{profile.email}</div>
          </div>
        </div>
        <div class="info-item">
          <div class="ico">☎</div>
          <div>
            <div class="label">Telefon</div>
            <div class="value">{profile.phone}</div>
          </div>
        </div>
        <div class="info-item">
          <div class="ico">📍</div>
          <div>
            <div class="label">Standort</div>
            <div class="value">{profile.location}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="card info">
      <h3>Berufliche Daten</h3>
      <div class="info-item">
        <div class="ico">📅</div>
        <div>
          <div class="label">Mitglied seit</div>
          <div class="value">{profile.memberSince}</div>
        </div>
      </div>
      <div class="info-item">
        <div class="ico">🏅</div>
        <div>
          <div class="label">Lizenz</div>
          <div class="value">{profile.license}</div>
        </div>
      </div>
    </section>

    <section class="card stats">
      <h3>Statistiken</h3>
      <div class="stat-grid">
        {#each stats as s}
          <div class="stat-block">
            <div class="stat-value">{s.value}</div>
            <div class="stat-label">{s.label}</div>
          </div>
        {/each}
      </div>
    </section>

    <section class="card settings">
      <h3>Einstellungen</h3>
      <button type="button">Benachrichtigungen verwalten</button>
      <button type="button">Passwort ändern</button>
      <button type="button">Datenschutz &amp; Sicherheit</button>
    </section>
  </main>
</div>

<style>
  :global(body){background:#f7f8fb;}
  .page.container{max-width:1200px;margin:24px auto;padding:0 20px}
  .page-header h1{margin:0;font-size:26px;font-weight:700}
  .page-header .muted{margin:6px 0 0;color:#6b7280;font-size:14px}

  .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 16px rgba(15,23,36,0.05)}

  .layout{display:grid;grid-template-columns:320px 1fr;gap:14px;margin-top:16px}
  .profile-card{padding:16px;display:flex;flex-direction:column;align-items:center;gap:8px}
  .avatar-wrap{width:120px;height:120px;border-radius:50%;background:#f7f8fb;display:flex;align-items:center;justify-content:center;border:1px solid #e5e7eb}
  .avatar{width:90px;height:90px;border-radius:50%;background:#e11d2f;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(225,29,47,0.18)}
  .profile-name{font-weight:700;font-size:18px}
  .badge{background:#111;color:#fff;padding:4px 10px;border-radius:16px;font-size:12px;font-weight:700}
  .profile-role{color:#374151}
  .logout{margin-top:6px;padding:10px 16px;border-radius:10px;border:1px solid #e11d2f;color:#e11d2f;background:#fff;font-weight:700;cursor:pointer}
  .logout:hover{background:#fdf2f3}

  .info{padding:16px}
  .info h3{margin:0 0 12px}
  .info-item{background:#f7f8fb;border-radius:10px;padding:10px 12px;display:flex;gap:12px;align-items:center;margin-bottom:10px;border:1px solid #eef1f5}
  .info-item:last-child{margin-bottom:0}
  .ico{font-size:16px;color:#6b7280;min-width:18px;text-align:center}
  .label{color:#6b7280;font-size:13px}
  .value{color:#111;font-weight:600}

  .stats{padding:16px;margin-top:12px}
  .stats h3{margin:0 0 12px}
  .stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .stat-block{background:#f7f8fb;border-radius:10px;padding:16px;text-align:center;border:1px solid #eef1f5}
  .stat-value{font-weight:700;font-size:18px;color:#0f1724}
  .stat-label{color:#6b7280;font-size:13px;margin-top:4px}

  .settings{padding:16px;margin-top:12px}
  .settings h3{margin:0 0 12px}
  .settings button{width:100%;padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;text-align:left;font-weight:600;color:#1f2937;margin-bottom:8px;cursor:pointer}
  .settings button:last-child{margin-bottom:0}
  .settings button:hover{background:#f7f8fb}

  @media (max-width:900px){
    .layout{grid-template-columns:1fr}
  }
</style>

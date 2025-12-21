<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import NavBar from '$lib/NavBar.svelte';
  import { evaluations } from '$lib/stores/evaluations';

  export let data;

  const profiles = {
    Daniel: {
      name: 'Daniel',
      role: 'Nationaltrainer',
      email: 'daniel.coach@karate-swiss.ch',
      phone: '+41 79 123 45 67',
      location: 'Zürich, Schweiz',
      memberSince: 'Januar 2020',
      license: 'A-Lizenz'
    },
    Andrea: {
      name: 'Andrea',
      role: 'Coach',
      email: 'andrea.coach@karate-swiss.ch',
      phone: '+41 79 555 22 11',
      location: 'Basel, Schweiz',
      memberSince: 'Mai 2021',
      license: 'B-Lizenz'
    },
    Marc: {
      name: 'Marc',
      role: 'Coach',
      email: 'marc.coach@karate-swiss.ch',
      phone: '+41 78 444 33 22',
      location: 'Bern, Schweiz',
      memberSince: 'August 2019',
      license: 'A-Lizenz'
    }
  };

  const normalize = (v) => (v || '').toString().trim().toLowerCase();
  const normalizeCoach = (v) => normalize((v || '').replace(/^coach\s+/i, ''));
  const displayAthlete = (obj) => (obj?.athlete || obj?.name || '').toString().trim();
  const dateKey = (v) => {
    const t = Date.parse(v || '');
    if (Number.isNaN(t)) return '';
    try {
      return new Date(t).toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  let evalList = [];
  let unsub;

  onMount(() => {
    unsub = evaluations.subscribe((val) => {
      evalList = Array.isArray(val) ? val : [];
    });
  });

  onDestroy(() => unsub?.());

  const readCoachFromCookie = () => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('coachName='));
    if (!match) return '';
    return decodeURIComponent(match.split('=')[1] || '');
  };

  $: coachName = data?.coachName || readCoachFromCookie() || 'Daniel';
  $: profile = profiles?.[coachName] || profiles.Daniel;
  $: coachKey = normalizeCoach(coachName || profile?.name);

  $: coachEvals = evalList.filter((ev) => normalizeCoach(ev?.coach) === coachKey);
  $: totalEvals = coachEvals.length;

  $: athletesFromEvaluations = Array.from(
    new Set(coachEvals.map((ev) => normalize(displayAthlete(ev))))
  ).filter(Boolean);
  $: coachAthletes = Array.isArray(data?.coachAthletes)
    ? data.coachAthletes.filter((a) => normalizeCoach(a?.coach) === coachKey)
    : [];
  $: athletesFromApi = coachAthletes.map(displayAthlete).map(normalize).filter(Boolean);
  $: uniqueAthletes = Array.from(new Set([...athletesFromApi, ...athletesFromEvaluations])).length;

  $: stats = (() => {
    const safeEval = totalEvals ?? 0;
    const safeAthletes = uniqueAthletes ?? 0;
    return [
      { value: safeEval, label: 'Bewertungen abgeschlossen' },
      { value: safeAthletes, label: 'Athleten betreut' }
    ];
  })();
</script>

<div class="app-shell">
  <NavBar active="profil" />

  <main class="page container">
    <header class="page-header">
      <h1>Mein Profil</h1>
      <p class="muted">Persönliche Daten</p>
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
        <button class="logout" type="button" on:click={() => goto('/')}>{'<-'} Abmelden</button>
      </div>

      <div class="card info reveal-card" style="--delay:0">
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

    <section class="card info professional reveal-card" style="--delay:1">
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

  .info.professional{margin-top:12px}
  .stats{padding:16px;margin-top:12px}
  .stats h3{margin:0 0 12px}
  .stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .stat-block{background:#f7f8fb;border-radius:10px;padding:16px;text-align:center;border:1px solid #eef1f5}
  .stat-value{font-weight:700;font-size:18px;color:#0f1724}
  .stat-label{color:#6b7280;font-size:13px;margin-top:4px}

  @media (max-width:900px){
    .layout{grid-template-columns:1fr}
  }

  .reveal-card{
    opacity:0;
    transform:translateY(18px);
    animation:cardReveal 520ms ease forwards;
    animation-delay:calc(var(--delay, 0) * 120ms);
  }

  @keyframes cardReveal{
    from{opacity:0;transform:translateY(18px)}
    to{opacity:1;transform:translateY(0)}
  }

  @media (prefers-reduced-motion: reduce){
    .reveal-card{animation:none;opacity:1;transform:none}
  }
</style>

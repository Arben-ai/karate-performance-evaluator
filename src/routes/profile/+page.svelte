<style>
.profile {
max-width: 800px;
margin: 0 auto;
}

.profile h1 {
color: #2c3e50;
margin-bottom: 1rem;
}

.profile-card {
background: white;
border: 1px solid #e0e0e0;
border-radius: 8px;
padding: 2rem;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
margin-bottom: 2rem;
}

.profile-header {
display: flex;
align-items: center;
gap: 2rem;
margin-bottom: 2rem;
padding-bottom: 2rem;
border-bottom: 1px solid #e0e0e0;
}

.avatar {
width: 120px;
height: 120px;
border-radius: 50%;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
display: flex;
align-items: center;
justify-content: center;
font-size: 3rem;
color: white;
}

.profile-info h2 {
color: #2c3e50;
margin: 0 0 0.5rem 0;
}

.profile-info p {
color: #666;
margin: 0.25rem 0;
}

.profile-section {
margin-bottom: 2rem;
}

.profile-section h3 {
color: #2c3e50;
margin-bottom: 1rem;
padding-bottom: 0.5rem;
border-bottom: 2px solid #2c3e50;
}

.info-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 1rem;
}

.info-item {
padding: 1rem;
background: #f8f9fa;
border-radius: 4px;
}

.info-item .label {
display: block;
color: #666;
font-size: 0.9rem;
margin-bottom: 0.25rem;
}

.info-item .value {
color: #2c3e50;
font-weight: 500;
}

.achievements {
display: flex;
gap: 1rem;
flex-wrap: wrap;
}

.badge {
padding: 0.75rem 1.5rem;
background: #f0f0f0;
border-radius: 20px;
font-size: 0.9rem;
color: #555;
}

button {
background-color: #2c3e50;
color: white;
padding: 0.75rem 2rem;
border: none;
border-radius: 4px;
font-size: 1rem;
cursor: pointer;
transition: background-color 0.3s;
margin-top: 1rem;
}

button:hover {
background-color: #34495e;
}
</style>

<div class="profile">
<h1>User Profile</h1>
<p>Manage your account and personal information</p>

<div class="profile-card">
<div class="profile-header">
<div class="avatar">🥋</div>
<div class="profile-info">
<h2>John Sensei</h2>
<p>Karate Instructor • Black Belt 3rd Dan</p>
<p>Member since 2024</p>
</div>
</div>

<div class="profile-section">
<h3>Personal Information</h3>
<div class="info-grid">
<div class="info-item">
<span class="label">Email</span>
<div class="value">john.sensei@karate.com</div>
</div>
<div class="info-item">
<span class="label">Phone</span>
<div class="value">+41 79 123 45 67</div>
</div>
<div class="info-item">
<span class="label">Location</span>
<div class="value">Zurich, Switzerland</div>
</div>
<div class="info-item">
<span class="label">Dojo</span>
<div class="value">ZHAW Karate Club</div>
</div>
</div>
</div>

<div class="profile-section">
<h3>Qualifications</h3>
<div class="info-grid">
<div class="info-item">
<span class="label">Belt Level</span>
<div class="value">Black Belt 3rd Dan</div>
</div>
<div class="info-item">
<span class="label">Certification</span>
<div class="value">International Instructor</div>
</div>
<div class="info-item">
<span class="label">Specialization</span>
<div class="value">Kata & Kumite</div>
</div>
<div class="info-item">
<span class="label">Years of Experience</span>
<div class="value">15 years</div>
</div>
</div>
</div>

<div class="profile-section">
<h3>Achievements</h3>
<div class="achievements">
<div class="badge">🏆 Regional Champion 2023</div>
<div class="badge">👨‍🏫 100+ Students Trained</div>
<div class="badge">⭐ Master Instructor</div>
<div class="badge">📚 Advanced Kata Specialist</div>
</div>
</div>

<button>Edit Profile</button>
</div>
</div>

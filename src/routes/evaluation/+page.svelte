<style>
.evaluation {
max-width: 800px;
margin: 0 auto;
}

.evaluation h1 {
color: #2c3e50;
margin-bottom: 1rem;
}

.evaluation-form {
background: white;
border: 1px solid #e0e0e0;
border-radius: 8px;
padding: 2rem;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-section {
margin-bottom: 2rem;
}

.form-section h3 {
color: #2c3e50;
margin-bottom: 1rem;
}

.form-group {
margin-bottom: 1rem;
}

.form-group label {
display: block;
margin-bottom: 0.5rem;
color: #555;
font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
width: 100%;
padding: 0.5rem;
border: 1px solid #ddd;
border-radius: 4px;
font-size: 1rem;
}

.form-group textarea {
min-height: 100px;
resize: vertical;
}

.criteria-list {
list-style: none;
padding: 0;
}

.criteria-list li {
margin-bottom: 0.5rem;
padding: 0.5rem;
background: #f8f9fa;
border-radius: 4px;
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
}

button:hover {
background-color: #34495e;
}
</style>

<div class="evaluation">
<h1>Performance Evaluation</h1>
<p>Conduct and record karate performance assessments</p>

<div class="evaluation-form">
<form>
<div class="form-section">
<h3>Athlete Information</h3>
<div class="form-group">
<label for="athlete-name">Athlete Name</label>
<input type="text" id="athlete-name" placeholder="Enter athlete name" />
</div>
<div class="form-group">
<label for="belt-level">Belt Level</label>
<select id="belt-level">
<option value="">Select belt level</option>
<option value="white">White Belt</option>
<option value="yellow">Yellow Belt</option>
<option value="orange">Orange Belt</option>
<option value="green">Green Belt</option>
<option value="blue">Blue Belt</option>
<option value="brown">Brown Belt</option>
<option value="black">Black Belt</option>
</select>
</div>
</div>

<div class="form-section">
<h3>Evaluation Criteria</h3>
<ul class="criteria-list">
<li>🥋 Kata Performance</li>
<li>🥊 Kumite Skills</li>
<li>💪 Physical Conditioning</li>
<li>🧘 Focus & Discipline</li>
<li>🎯 Technique Precision</li>
</ul>
</div>

<div class="form-section">
<h3>Overall Assessment</h3>
<div class="form-group">
<label for="score">Performance Score (1-10)</label>
<input type="number" id="score" min="1" max="10" placeholder="Enter score" />
</div>
<div class="form-group">
<label for="notes">Notes</label>
<textarea id="notes" placeholder="Enter evaluation notes..."></textarea>
</div>
</div>

<button type="submit">Save Evaluation</button>
</form>
</div>
</div>

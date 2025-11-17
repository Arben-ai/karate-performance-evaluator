<style>
	.dashboard {
		text-align: center;
	}

	.dashboard h1 {
		color: #2c3e50;
		margin-bottom: 1rem;
	}

	.dashboard-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.card {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		transition: transform 0.3s, box-shadow 0.3s;
	}

	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 8px rgba(0,0,0,0.2);
	}

	.card h3 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	.card p {
		color: #666;
	}
</style>

<div class="dashboard">
	<h1>Dashboard</h1>
	<p>Welcome to the Karate Performance Evaluator</p>

	<div class="dashboard-cards">
		<div class="card">
			<h3>📊 Recent Evaluations</h3>
			<p>View and manage your recent karate performance evaluations</p>
		</div>
		<div class="card">
			<h3>📈 Performance Trends</h3>
			<p>Track performance improvements over time</p>
		</div>
		<div class="card">
			<h3>🥋 Upcoming Sessions</h3>
			<p>See scheduled evaluation sessions</p>
		</div>
		<div class="card">
			<h3>👤 Athletes</h3>
			<p>Manage athlete profiles and records</p>
		</div>
	</div>
</div>

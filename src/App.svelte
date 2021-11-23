<script>
	import { onMount } from "svelte";
	import WebSocket from 'ws';
	const ws = new WebSocket('ws://192.168.0.155:3005');

	ws.on('open', function open() {
  		ws.send('Socket connection from svelte');
	});

	ws.on('message', function incoming(message) {
  		console.log('received: %s', message);
	});


	export let name;
	let getCurTemp = 'http://192.168.0.155:3000/getCurTemp';
	let getSetPoint = 'http://192.168.0.155:3000/getSetPoint';
	let changeSetPoint = 'http://192.168.0.155:3000/changeSetPoint';

	let curTemp;
	let setPoint;

	async function fetchData() {
		await fetch(getCurTemp)
		.then(r => {
			return r.json();
		})
		.then(data => {
			console.log(data);
			curTemp = data;
		})
	}

	async function getSetpoint() {
		await fetch(getSetPoint)
		.then(r => {
			return r.json();
		})
		.then(data => {
			console.log(data);
			setPoint = data;
		})
	}

	async function setTemp() {
		await fetch(changeSetPoint,
		{
			method: 'POST',
			headers: {
      			'Content-Type': 'application/json'
			},
			body: JSON.stringify(80)
		})
		.then(r => {
			return r.json();
		})
		.then(data => {
			console.log(data);
		})
	}
	onMount(fetchData);
	onMount(getSetpoint);
</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
	<p>Temp = {curTemp}</p>
	<p>SetPoint = {setPoint}</p>
	<button on:click={setTemp}>Set Temp to 80</button>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
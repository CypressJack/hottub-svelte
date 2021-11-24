<script>
	import { onMount } from "svelte";
	const exampleSocket = new WebSocket('ws://192.168.0.155:3005');

	// Initialize data object store
	let data = {
		currentTemp: null,
		setPoint: null,
		jets: null
	}

	// Open socket
	exampleSocket.onopen = function (event) {
  		exampleSocket.send(JSON.stringify("Client Connected"));
	};

	// Hand data sent from server
	exampleSocket.onmessage = function (event) {
		const res = JSON.parse(event.data);

		// Assign received setPoint
		if (res.setPoint) {
			data.setPoint = res.setPoint;
		}

		// Assign receieved tempurature
		if (res.currentTemp) {
			data.currentTemp = res.currentTemp;
		}

		// Assign jets status
		if (res.jets && res.jets === 'jetsOn') {
			data.jets = true;
		}

		// Assign jets status
		if (res.jets && res.jets === 'jetsOff') {
			data.jets = false;
		}

	};

	// Set setPoint up
	function setPointUp(){
		exampleSocket.send(JSON.stringify('setPointUp'));
	}

	// Set setPoint down
	function setPointDown(){
		exampleSocket.send(JSON.stringify('setPointDown'));
	}

	function operateJets(){
		if (data.jets) {
		  exampleSocket.send(JSON.stringify('jetsOff'));
		}

		if (!data.jets) {
		  exampleSocket.send(JSON.stringify('jetsOn'));
		}
	}

	export let name;

</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
	<p>Temp = {data.currentTemp}</p>
	<p>SetPoint = {data.setPoint}</p>
	<p>Jets = {data.jets ? 'Jets are on' : 'Jets are off'}</p>
	<button on:click={setPointUp}>SetPoint up</button>
	<button on:click={setPointDown}>SetPoint down</button>
	<button on:click={operateJets}>Turn jets on</button>
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
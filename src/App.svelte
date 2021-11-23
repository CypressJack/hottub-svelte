<script>
	import { onMount } from "svelte";
	const exampleSocket = new WebSocket('ws://192.168.0.155:3005');

	let data = {
		currentTemp: undefined,
		setPoint: undefined,
	}

	exampleSocket.onopen = function (event) {
  		exampleSocket.send(JSON.stringify("Here's some text that the server is urgently awaiting!"));
	};

	exampleSocket.onmessage = function (event) {
		const res = JSON.parse(event.data);
		if (res.currentTemp && res.setPoint) {
			data.currentTemp = res.currentTemp;
			data.setPoint = res.setPoint;
		}

		if (res.setPoint && !res.currentTemp) {
			data.setPoint = res.setPoint;
		}

		if (res.currentTemp && !res.setPoint) {
			data.currentTemp = res.currentTemp;
		}
	};

	function setPointUp(){
		exampleSocket.send(JSON.stringify('setPointUp'));
	}

	function setPointDown(){
		exampleSocket.send(JSON.stringify('setPointDown'));
	}

	export let name;

</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
	<p>Temp = {data.currentTemp}</p>
	<p>SetPoint = {data.setPoint}</p>
	<button on:click={setPointUp}>SetPoint up</button>
	<button on:click={setPointDown}>SetPoint down</button>
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
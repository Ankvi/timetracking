const BASE_URL = "https://api.track.toggl.com/api";
const ME_URL = `${BASE_URL}/v9/me`;

const credentials = Buffer.from(
	`${Bun.env.TOGGL_API_TOKEN}:api_token`,
).toString("base64");

const headers = {
	Authorization: `Basic ${credentials}`,
};

export async function me() {
	const response = await fetch(ME_URL, {
		headers,
	});

	console.log(await response.json());
}

export async function currentTimeEntry() {
	const response = await fetch(`${ME_URL}/time_entries/current`, {
		headers,
	});

	const json = await response.json();
	console.log(json);
}

declare namespace NodeJS {
	interface ProcessEnv {
		XDG_RUNTIME_DIR: string;
		TOGGL_API_TOKEN: string;
		HOME: string;
	}
}

interface RequestInit {
	unix?: string;
}

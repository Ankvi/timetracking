declare namespace NodeJS {
    interface ProcessEnv {
        XDG_RUNTIME_DIR: string;
        TOGGL_API_TOKEN: string;
        JIRA_TOKEN: string;
        HOME: string;
        TERMINAL: string;
        UID: string;
    }
}

interface RequestInit {
    unix?: string;
}

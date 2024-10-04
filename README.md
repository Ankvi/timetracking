# Timetracking

Welcome to the linux automated time tracker!

## How it works

By starting listeners on certain OS window manager (e.g. Swaywm or Hyprland), we can automatically detect
when your designated editor is the currently focused window.
Using a specific branch naming and window title of a code editor, we can use this information
to automatically start time trackers using Toggl

## Prerequisites

- Specific branch naming convention
  - {BRANCH_TYPE}/{JIRA_TEAM}-{JIRA_TICKET_NUMBER}-something-descriptive
  - e.g. `feature/CID-1337-something`
- An editor with a specific title naming convention
  - e.g. `tmux | {DIRECTORY} | {CURRENT_GIT_BRANCH}`
- A toggl time tracker account with a generated personal access token (PAT)
- Toggl projects that match the name of the Jira teams (e.g. CID, OTHER)
- A generated PAT for Jira

## Starting the program

Start by providing the `TOGGL_API_TOKEN` and `JIRA_TOKEN` in a way that suits you.
They can be set directly to the system or through a `.env` file in the project folder.

Install the node dependencies using `bun install` then start the service with with `bun start`

You can optionally configure your window manager to automatically pause the timers based
on system inactivity using the `bun index.ts pause` and restarting them using
`bun index.ts resume`.

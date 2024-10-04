# Timetracking

Welcome to the linux automated time tracker!

## How it works

By starting listeners on certain OS window manager (e.g. Swaywm or Hyprland), we can automatically detect
when your designated editor is the currently focused window.

### Prerequisites

- Specific branch naming convention
  - {BRANCH_TYPE}/{JIRA_TEAM}-{JIRA_TICKET_NUMBER}-something-descriptive
  - e.g. `feature/CID-1337-something`
- An editor with a specific title naming convention
  - e.g. `tmux | {DIRECTORY} | {CURRENT_GIT_BRANCH}`
- A toggl time tracker account with a generated personal access token (PAT)
- Toggl projects that match the name of the Jira teams (e.g. CID, OTHER)
- A generated PAT for Jira

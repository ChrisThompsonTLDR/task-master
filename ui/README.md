# Taskmaster UI

This is the frontend for Taskmaster, a powerful, AI-driven task management tool designed to streamline your development workflow. This application provides a user-friendly interface to interact with the Taskmaster service, allowing you to manage tasks, view reports, and leverage AI to enhance your productivity.

## Table of Contents
- [Taskmaster UI](#taskmaster-ui)
  - [Table of Contents](#table-of-contents)
  - [✨ Features](#-features)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [🛠️ Usage](#️-usage)
    - [Available Scripts](#available-scripts)
  - [Built With](#built-with)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)

## ✨ Features

- **Task Management**: Create, view, update, and delete tasks and subtasks.
- **AI-Powered Assistance**: Leverage AI to generate tasks from PRDs, expand complex tasks, and perform research.
- **Multiple Views**: Visualize your project through task lists, task files, and a project tree.
- **Reporting**: Analyze task complexity and view detailed reports.
- **Configuration**: Easily configure AI models and other settings.
- **Responsive Design**: A clean, modern interface built with React, Tailwind CSS, and other modern technologies.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/install/)

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/your-username/taskmaster-ui.git
    cd taskmaster-ui
    ```

2.  **Install dependencies**
    ```sh
    npm install
    ```
    or
    ```sh
    yarn install
    ```

## 🛠️ Usage

To start the development server, run the following command:

```sh
npm run dev
```

This will start the Vite development server and you can view your application at `http://localhost:5173`.

### Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run lint`: Lints the code using ESLint.
-   `npm run preview`: Previews the production build locally.

## Built With

- [React](https://reactjs.org/) - The web framework used
- [Vite](https://vitejs.dev/) - Frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [React Router](https://reactrouter.com/) - For routing
- [D3.js](https://d3js.org/) - For data visualization
- And more!

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE.txt` for more information.
<!-- TASKMASTER_EXPORT_START -->
> 🎯 **Taskmaster Export** - 2025-06-29 15:01:40 UTC
> 📋 Export: without subtasks • Status filter: none
> 🔗 Powered by [Task Master](https://task-master.dev?utm_source=github-readme&utm_medium=readme-export&utm_campaign=taskmonster&utm_content=task-export-link)

```
╭─────────────────────────────────────────────────────────╮╭─────────────────────────────────────────────────────────╮
│                                                         ││                                                         │
│   Project Dashboard                                     ││   Dependency Status & Next Task                         │
│   Tasks Progress: ████████████████████ 100%    ││   Dependency Metrics:                                   │
│   100%                                                   ││   • Tasks with no dependencies: 0                      │
│   Done: 10  In Progress: 0  Pending: 0  Blocked: 0     ││   • Tasks ready to work on: 0                          │
│   Deferred: 0  Cancelled: 0                             ││   • Tasks blocked by dependencies: 0                    │
│                                                         ││   • Most depended-on task: #3 (2 dependents)           │
│   Subtasks Progress: ████████████████████     ││   • Avg dependencies per task: 1.1                      │
│   100% 100%                                               ││                                                         │
│   Completed: 50/50  In Progress: 0  Pending: 0      ││   Next Task to Work On:                                 │
│   Blocked: 0  Deferred: 0  Cancelled: 0                 ││   ID: N/A - No task available     │
│                                                         ││   Priority:   Dependencies: None                    │
│   Priority Breakdown:                                   ││   Complexity: N/A                                       │
│   • High priority: 5                                   │╰─────────────────────────────────────────────────────────╯
│   • Medium priority: 3                                 │
│   • Low priority: 2                                     │
│                                                         │
╰─────────────────────────────────────────────────────────╯
┌───────────┬──────────────────────────────────────┬─────────────────┬──────────────┬───────────────────────┬───────────┐
│ ID        │ Title                                │ Status          │ Priority     │ Dependencies          │ Complexi… │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 1         │ Remove Edit Button from TaskDetailPa │ ✓ done          │ high         │ None                  │ ● 4       │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 2         │ Remove Edit Form UI from TaskDetailP │ ✓ done          │ high         │ 1                     │ ● 5       │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 3         │ Remove Edit State and Handlers from  │ ✓ done          │ high         │ 2                     │ ● 6       │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 4         │ Ensure All Task Fields are Read-Only │ ✓ done          │ high         │ 3                     │ ● 5       │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 5         │ Deprecate updateTask in TaskContext. │ ✓ done          │ medium       │ 3                     │ ● 6       │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 6         │ Remove updateTask from taskService.t │ ✓ done          │ medium       │ 5                     │ ● 4       │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 7         │ Add Code Comments for Future Re-impl │ ✓ done          │ low          │ 6                     │ ● 4       │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 8         │ Add 'View-Only' UI Indicator         │ ✓ done          │ low          │ 4                     │ ● 5       │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 9         │ Audit Codebase for Residual Edit Log │ ✓ done          │ medium       │ 6                     │ ● 2       │
├───────────┼──────────────────────────────────────┼─────────────────┼──────────────┼───────────────────────┼───────────┤
│ 10        │ End-to-End Regression Testing of Tas │ ✓ done          │ high         │ 4, 8, 9               │ ● 4       │
└───────────┴──────────────────────────────────────┴─────────────────┴──────────────┴───────────────────────┴───────────┘
```


╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                      │
│   Suggested Next Steps:                                                              │
│                                                                                      │
│   1. Run task-master next to see what to work on next                                │
│   2. Run task-master expand --id=<id> to break down a task into subtasks             │
│   3. Run task-master set-status --id=<id> --status=done to mark a task as complete   │
│                                                                                      │
╰──────────────────────────────────────────────────────────────────────────────────────╯

> 📋 **End of Taskmaster Export** - Tasks are synced from your project using the `sync-readme` command.
<!-- TASKMASTER_EXPORT_END -->

# Contributing Guide

Thank you for your interest in the Smart City Dashboard project! Below are the guidelines for contributing.

## Getting Started

### Fork & Clone

```bash
# Fork the repository on GitHub, then clone
git clone https://github.com/<your-username>/project-iot-final.git
cd project-iot-final
git remote add upstream https://github.com/<original-owner>/project-iot-final.git
```

### Create a Working Branch

```bash
git checkout -b feature/my-new-feature
```

Name your branch following these conventions:
- `feature/feature-name` for new features
- `fix/bug-name` for bug fixes
- `docs/doc-name` for documentation
- `refactor/refactor-name` for refactoring

## Contribution Workflow

1. **Ensure code works correctly**: Test on the Wokwi Simulator before submitting
2. **Write clear commit messages**: Keep them concise and accurately describe the changes
3. **Create a Pull Request**: Provide a detailed description of what changed and why

## Code Conventions

### ESP32 Firmware (main.cpp)

- Follow Arduino/PlatformIO coding style
- Use `#define` for GPIO pin constants
- Break logic into small, meaningful functions
- Comment on complex logic sections

### Frontend (script.js, styles.css)

- Use ES Modules (`import`/`export`)
- Do not add new libraries without prior discussion
- Maintain the existing neo-brutalism design style
- Variable and function names in English, UI text in Vietnamese

### Firebase

- Do not change the data structure without updating both ESP32 firmware and frontend
- Keep the `smartcity/` path as the main namespace

## Reporting Bugs

When reporting a bug, please provide:

- A detailed description of the issue
- Steps to reproduce the bug
- Screenshots (if UI-related)
- Console logs (F12 > Console)
- Browser version and operating system

## Feature Requests

Open an Issue with the `enhancement` label and describe:

- The problem you want to solve
- Your proposed solution
- Alternatives you have considered

## License

By contributing, you agree that your contributions will be distributed under the project's MIT License.

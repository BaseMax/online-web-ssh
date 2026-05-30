# Contributing to Online Web SSH

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/online-web-ssh.git
   cd online-web-ssh
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/BaseMax/online-web-ssh.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/your-bug-fix
   ```

### Making Changes

1. **Follow the code style** of the project
2. **Write clean, readable code** with meaningful variable names
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Add comments** for complex logic

### Code Style Guidelines

#### JavaScript
- Use `var` for variables (consistent with existing code)
- Use camelCase for function and variable names
- Use UPPER_CASE for constants
- Add JSLint pragma at the top: `/*jslint browser:true */`
- Keep lines reasonably short (max 100 characters)

```javascript
/*jslint browser:true */
var myVariable = 'value';
function myFunction(param) {
  // implementation
}
```

#### CSS
- Use CSS custom properties (variables) for colors
- Keep selectors simple and specific
- Use mobile-first approach with media queries
- Group related rules together

```css
:root {
  --primary-color: #0d6efd;
}

.my-class {
  color: var(--primary-color);
  padding: 1rem;
}

@media (max-width: 768px) {
  .my-class {
    padding: 0.5rem;
  }
}
```

#### HTML
- Use semantic HTML5 elements
- Include proper accessibility attributes (aria-*, labels, etc.)
- Keep indentation consistent
- Use lowercase for tag names

### Testing

Before submitting a pull request:

1. **Test in multiple browsers**:
   - Chrome/Chromium
   - Firefox
   - Safari
   - Edge

2. **Test on different devices**:
   - Desktop
   - Tablet
   - Mobile

3. **Test various scenarios**:
   - SSH key authentication
   - Password authentication
   - Connection failures
   - Terminal resizing
   - Different terminal types

4. **Check the browser console** for errors (F12)

### Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

2. **Write meaningful commit messages**:
   - Use imperative mood ("Add feature" not "Added feature")
   - Keep first line under 50 characters
   - Add more details in the body if needed

   Example:
   ```
   Add dark mode support
   
   - Implement dark theme toggle
   - Update CSS variables for dark colors
   - Store preference in localStorage
   - Test on multiple browsers
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Submit a Pull Request**:
   - Go to GitHub and click "Compare & pull request"
   - Fill out the PR template completely
   - Link any related issues
   - Describe what you changed and why

### Pull Request Guidelines

Your PR should:

- [ ] Have a clear, descriptive title
- [ ] Include a detailed description of changes
- [ ] Reference any related issues
- [ ] Include screenshots/GIFs for UI changes
- [ ] Test on multiple browsers
- [ ] Follow the code style guidelines
- [ ] Update documentation if needed
- [ ] Commit history is clean (consider squashing if needed)

Example PR description:

```markdown
## Description
Add support for custom SSH port ranges in the UI.

## Related Issues
Closes #123

## Changes Made
- Added port range input field
- Validate port ranges (1-65535)
- Update form validation logic
- Add tooltips for port range help

## Testing
- Tested with valid port ranges
- Tested with invalid inputs
- Tested on Chrome, Firefox, Safari
- Tested on mobile devices

## Screenshots
[Add screenshots here if UI changes]
```

## Reporting Bugs

Create an issue with the following information:

1. **Title**: Clear, concise description of the bug
2. **Environment**:
   - Browser and version
   - Operating system
   - Device type (desktop/mobile)
3. **Description**: Detailed explanation of the bug
4. **Steps to Reproduce**: Clear steps to replicate
5. **Expected Behavior**: What should happen
6. **Actual Behavior**: What actually happens
7. **Screenshots/Logs**: If applicable
8. **Possible Solution**: If you have an idea

Example bug report:

```markdown
## Title
Terminal not displaying correctly on mobile devices

## Environment
- Browser: Safari 14.0
- OS: iOS 14.4
- Device: iPhone 12

## Description
The terminal output is not visible on mobile devices when in portrait mode.

## Steps to Reproduce
1. Open the application on an iPhone in portrait orientation
2. Connect to an SSH server
3. Type a command

## Expected Behavior
Terminal should display full output and be responsive

## Actual Behavior
Terminal appears blank or shows only partial output

## Screenshots
[Screenshot image]
```

## Feature Requests

Create an issue with:

1. **Title**: Brief description of the feature
2. **Use Case**: Why this feature is needed
3. **Proposed Solution**: How it should work
4. **Alternatives**: Other approaches considered

Example feature request:

```markdown
## Title
Add file transfer capability (SFTP)

## Use Case
Users need to transfer files to/from SSH servers without leaving the web interface.

## Proposed Solution
- Add SFTP file browser tab
- Drag-and-drop file upload
- Download files from server

## Alternatives
- Launch external SFTP client (current workaround)
- Use scp commands in terminal (manual)
```

## Code Review Process

- Maintainers will review your PR
- You may be asked to make changes
- Once approved, your PR will be merged
- Your contribution will be acknowledged

## Community

- **Discussions**: Use GitHub Discussions for questions
- **Chat**: [Add any chat platform if applicable]
- **Code of Conduct**: Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or discussion if you have any questions!

---

Thank you for contributing to Online Web SSH! 🎉

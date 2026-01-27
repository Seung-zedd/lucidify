# Agent Behavioral Rules

♻️ _This markdown file can be re-used anytime you wanna build a new app_

## 1. 🧠 Cognitive Protocol (Mandatory MCP Usage)

**Rule: Think Before You Code.**
For any task involving **logic implementation, refactoring, debugging, or architectural changes**, you **MUST** use the `sequentialthinking` tool (MCP) as your FIRST step.

**Trigger Conditions:**

- When the user asks for a feature implementation (e.g., "Implement Prompt Batching").
- When analyzing a bug or a complex error log.
- When planning a refactoring strategy.

**Execution Steps:**

1.  **Initiate `sequentialthinking`:** Do not output any code or text explanation until you have invoked this tool.
2.  **Analyze & Plan:** Use the tool to:
    - Break down the user's request into atomic steps.
    - Identify potential risks (e.g., "Will this break the `dev` branch?").
    - Formulate a hypothesis or a step-by-step implementation plan.
3.  **Review:** Only after the sequential thinking process is complete and you have a clear path, proceed to write code or answer.

**Rule: Terminal Command Notification.**
If a task requires terminal commands (e.g., `mkdir`, `mv`, `rm`, `pnpm install`), you **MUST NOT** execute them directly. Instead, **notify the user** of the exact commands needed so they can run them manually. This is to ensure efficiency and avoid delays in command processing.

**Exception:**

- Simple content generation (e.g., "Write a README") or trivial fixes (e.g., typos) do not require this tool.

## 2. Documentation Lookup

When I need code generation, setup or configuration steps, or library/API documentation:

1. **Primary:** Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.
2. **Fallback:** If Context7 is unavailable, use web search to find the official documentation from:
   - GitHub repositories (README, docs folder)
   - Official documentation sites (e.g., svelte.dev, kit.svelte.dev)
   - Package registry pages (npm)

Always prioritize official sources over blog posts or Stack Overflow answers.

## 3. Commit Message Convention

We follow a convention combining Gitmoji and Conventional Commits.

**Format:** `[Gitmoji] [Type]: [Title]`

**Gitmoji & Types:**

- ✨ `:sparkles:` `feat`: New features
- 🐛 `:bug:` `fix`: Bug fixes
- 📚 `:books:` `docs`: Documentation changes
- 💄 `:lipstick:` `ui`: UI changes
- ♻️ `:recycle:` `refactor`: Code refactoring
- 🚀 `:rocket:` `deploy`: Deployment tasks
- ⚙️ `:gear:` `chore`: Build/config changes
- ✅ `:white_check_mark:` `test`: Adding/fixing tests
- 🚑 `:ambulance:` `hotfix`: Critical hotfixes

**Rule:** After completing a significant task or a series of related changes, **ALWAYS** provide a **single-line** git commit message in the format above with adding adequate gitmoji at the start of the commit message. Focus on the most significant change.

## 4. Testing Strategy

We prioritize automated testing to ensure high quality and reliability.

1. **Framework:** Use **Vitest** and **Svelte Testing Library** for frontend and API route testing.
2. **Execution:** Before finalizing complex logic, ensure tests are written and passing.

## 5. Coding Standards & Design Principles

### 5.1 SOLID Principles (Strict Enforcement)

- **SRP (Single Responsibility Principle):**
  - Each component or utility must have **one and only one reason to change**.
  - Do NOT create "God Components". If a Svelte component exceeds 300 lines or handles mixed concerns, split it.
- **OCP (Open/Closed Principle):**
  - Design for extension. Use slots and snippets for components that might change content.
- **DIP (Dependency Inversion):**
  - Always depend on abstractions. Use Svelte context or stores/runes for dependency injection where appropriate.

### 6. SvelteKit & Svelte 5 Best Practices

- **Runes ($state):** Convert `let var = val;` to `let var = $state(val);`.
- **Props ($props):** Replace `export let prop;` with `let { prop } = $props();`.
- **Derived ($derived):** Convert `$: double = count * 2;` to `let double = $derived(count * 2);`.
- **Effects ($effect):** Convert `$: { sideEffect(); }` to `$effect(() => { sideEffect(); });`.
- **Events:** Prefer callback props over `createEventDispatcher`.
- **Icons:** Use `@lucide/svelte` for icon imports. **Rule:** Always use individual sub-path imports (e.g., `import Menu from "@lucide/svelte/icons/menu"`) instead of barrel imports to avoid deprecation warnings and improve tree-shaking.
- **Cleanup:** Remove unused imports and ensure `lang="ts"`.

### 7. API Routes (SvelteKit Backend)

- **Validation:** Use Zod or similar for validating incoming request data in `+server.ts`.
- **Error Handling:** Use `error()` from `@sveltejs/kit` to return proper HTTP status codes.
- **Security:** Ensure sensitive operations are protected by authentication checks (e.g., Supabase session).

### 8. Frontend Logging & Environment Checks

- **Logging:** All `console.log`, `console.error`, and other debug logs MUST be wrapped in an environment check to prevent leaking information in production.
- **Environment Check:** Use `IS_DEV_MODE` from `$lib/utils/env` to check if the app is running in development mode (Local OR Staging).
- **Example:**

  ```typescript
  import { IS_DEV_MODE } from "$lib/utils/env";

  if (IS_DEV_MODE) {
    console.log("Debug info:", data);
  }
  ```

## 9. Localization Rule

- **English Only:** All annotations, comments, and documentation MUST be written in English. This applies to all files (Svelte, TS, JS, etc.).

## 10. 📁 File Upload & Validation Rules

- **Size Limit:** The maximum allowed size is **20MB** (Total and individual files).
- **UI/UX Feedback:**
  - **Global Error:** Show a **Red Toast notification** with a message like "Total file size exceeds the 20MB limit."
  - **Individual File Feedback:** For specific files exceeding the limit, highlight the file card with a **Red Border** and display a **Red Exclamation Icon (Tooltip)** explaining the error.
- **Implementation Note:** Use Svelte 5 Runes for state management and ensure smooth transitions for toast/tooltip visibility.

## 11. 📦 Dependency Management (pnpm-lock.yaml)

- **Rule: Review Lockfile After Changes.**
- Whenever you add, remove, or update frontend dependencies (e.g., using `pnpm add`), you **MUST** run `pnpm install` to ensure `pnpm-lock.yaml` is up to date and consistent with `package.json`.

## 12. ♿ Accessibility (a11y)

- **Interactive Elements**: Use semantic tags like `<button>` or `<a>` for clickable elements. Avoid adding `onclick` to non-interactive tags like `<div>`, `<span>`, or `<h3>`. If a non-interactive tag must be used, it MUST be accompanied by appropriate ARIA roles and keyboard event handlers.
- **Focus Management**: Avoid the `autofocus` attribute as it can disrupt screen readers and navigation flow. Use a custom Svelte action (e.g., `use:focus`) to manage focus programmatically when elements appear or state changes.
- **Keyboard Support**: Ensure all interactive elements are reachable and operable via keyboard. Standard `<button>` and `<a>` tags provide this by default.
- **Alt Text**: All images and icons must have descriptive `alt` text or be marked as decorative (e.g., `aria-hidden="true"`) if they don't convey unique information.

## 13. API Request Headers (415 Error Prevention)

- **Content-Type**: When making `POST`, `PUT`, or `PATCH` requests using `fetch`, you **MUST** explicitly set the `Content-Type` header to `application/json` if the body is a JSON string.

## 14. 📊 Vercel Insights & Analytics

- **Rule: Wrap Injection in Environment Checks.**
- Always wrap `injectSpeedInsights()` and `injectAnalytics()` in a check for `browser && !dev` from `$app/environment`.
- **Example:**
  ```javascript
  if (browser && !dev) {
    injectSpeedInsights();
    injectAnalytics();
  }
  ```

## 15. 📦 Import Verification Rule

- **Rule: Verify Imports After Every Edit.**
- Whenever you add a new component, icon, or utility to a file, you **MUST** immediately verify and add the corresponding import statement.
- **Verification:** Before finishing a task, run `pnpm run check` to ensure no "cannot find symbol" or "missing import" errors exist.

## 16. 🛡️ XSS Prevention Rule

- **Rule: Avoid `{@html}` with User-Controlled Input.**
- To prevent Cross-Site Scripting (XSS) attacks, **NEVER** use Svelte's `{@html}` tag to render strings that contain or are derived from user input.
- **Safe Alternative for Line Breaks:** Use standard Svelte interpolation `{}` combined with the CSS property `white-space: pre-wrap;` and newline characters (`\n`) in your strings.

## 17. 🎨 Lucidify Aesthetic & UI Adaptation

When adapting external UI code:

1.  **Color Mapping:** Strictly map primary colors to Lucidify theme (e.g., Zinc/Slate for dark mode, with vibrant accents).
2.  **Dark Mode First:** Optimize all backgrounds and contrasts for a dark theme (Zinc-950/Black).
3.  **Tailwind Conversion:** Prefer Tailwind CSS classes over raw `<style>` tags.
4.  **Consistency:** Match existing design tokens:
    - **Border Radius:** Use `rounded-2xl` for main cards/modals, `rounded-xl` for buttons.
    - **Typography:** Use modern sans-serif fonts.
    - **Transitions:** Use smooth, consistent transitions (e.g., `duration-200`).

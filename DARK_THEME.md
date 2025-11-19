# Dark Theme Implementation

This project now supports dark theme functionality using `next-themes`.

## Features

- 🌙 Dark mode support
- ☀️ Light mode support
- 💻 System preference detection
- 🔄 Smooth theme transitions
- 💾 Theme preference persistence

## Components

### ThemeProvider

Located in `components/providers/ThemeProvider.tsx`

- Wraps the entire app in the root layout
- Handles theme persistence and hydration
- Supports system preference detection

### ThemeToggle

Located in `components/ThemeToggle.tsx`

- Simple toggle button that switches between light and dark
- Used in the navbar components
- Shows sun/moon icons with smooth transitions

### ThemeToggleDropdown

Located in `components/ThemeToggleDropdown.tsx`

- Dropdown menu with Light, Dark, and System options
- Allows users to explicitly choose system preference
- More comprehensive theme selection

## Usage

The theme toggle is already integrated into:

- Dashboard navbar (`app/dashboard/components/navbar.tsx`)
- Document navbar (`app/document/components/DocumentNavbar.tsx`)

To use the theme toggle in other components:

```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

// Simple toggle
<ThemeToggle />;
```

Or use the dropdown version:

```tsx
import { ThemeToggleDropdown } from "@/components/ThemeToggleDropdown";

// Dropdown with system option
<ThemeToggleDropdown />;
```

To programmatically control the theme:

```tsx
"use client";

import { useTheme } from "next-themes";

function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle theme
    </button>
  );
}
```

## Styling

Dark mode styles are applied using Tailwind's `dark:` variant:

```tsx
<div className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
  Content that adapts to theme
</div>
```

All color variables are defined in `app/globals.css` with separate definitions for light and dark modes.

## Configuration

The theme provider is configured in `app/layout.tsx` with:

- `attribute="class"` - Uses class-based dark mode
- `defaultTheme="system"` - Defaults to system preference
- `enableSystem` - Enables system theme detection
- `disableTransitionOnChange` - Prevents flash during theme changes

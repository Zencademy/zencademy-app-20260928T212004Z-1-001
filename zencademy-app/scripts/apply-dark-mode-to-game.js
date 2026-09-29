// Helper script to apply dark mode to physical training games
// This is a reference - actual changes are made via search_replace

// Pattern to apply:
// 1. Add import: import { useTheme } from '../../../components/ThemeContext';
// 2. Convert exercises array to getExercises function that takes theme
// 3. Update icon colors from "#23242b" to theme.text
// 4. Add useTheme hook in component
// 5. Update all hardcoded colors to use theme properties
// 6. Update styles to remove hardcoded colors



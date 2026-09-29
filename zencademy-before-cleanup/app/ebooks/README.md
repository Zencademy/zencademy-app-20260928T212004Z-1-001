# Ebook Library Structure

## Overview
This directory contains the organized ebook library for the Zencademy app. Each ebook is a standalone React Native component with comprehensive content and navigation.

## Folder Structure
```
app/ebooks/
├── README.md
└── wellness/
    ├── MindfulLivingGuide.tsx
    ├── StressManagement.tsx
    └── AdvancedMeditationTechniques.tsx
```

## Ebook Features
Each ebook includes:
- **Chapter Navigation**: Horizontal scrollable chapter tabs
- **Page Navigation**: Previous/Next buttons with page counting
- **Content Management**: Automatic word-per-page calculation
- **Responsive Design**: Clean, readable interface
- **Back Navigation**: Consistent with app navigation patterns

## Content Structure
Each ebook follows this structure:
```typescript
const chapters = [
  {
    id: 1,
    title: "Chapter Title",
    content: "Chapter content...",
    pages: 3 // Approximate pages based on word count
  }
];
```

## Navigation Integration
Ebooks are integrated with the main EbookScreen through:
- Level-based unlocking system
- Direct navigation from ebook cards
- Consistent user experience

## Adding New Ebooks
1. Create a new `.tsx` file in the appropriate category folder
2. Follow the existing component structure
3. Add navigation case in `EbookScreen.tsx`
4. Update the ebook data array with new entry

## Categories
- **Wellness**: Mindfulness, stress management, meditation
- **Fitness**: Physical training, nutrition, performance
- **Mental**: Cognitive enhancement, focus, memory
- **Productivity**: Habits, time management, leadership
- **Science**: Quantum physics, psychology, neuroscience
- **Technology**: AI, blockchain, programming
- **Education**: History, philosophy, economics
- **Business**: Entrepreneurship, finance, investments
- **Creativity**: Creative thinking, digital art, writing
- **Lifestyle**: Relationships, parenting, minimalism
- **Spirituality**: Spiritual growth, Eastern philosophy

## Technical Notes
- Each ebook uses approximately 150 words per page
- Content is automatically paginated
- Navigation state is managed with React hooks
- Styling follows the app's design system
- All ebooks are authored by "Zencademy"

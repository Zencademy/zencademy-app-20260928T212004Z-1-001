const fs = require('fs');
const path = require('path');

// Game descriptions and instructions
const GAME_INFO = {
  'FocusEasyGame': {
    title: 'Focus Easy',
    description: 'Test your focus and attention by tapping only the highlighted circle while avoiding distractors.',
    instructions: 'Tap ONLY the highlighted circle. Avoid tapping any other circles. Each correct tap gives you +5 points!'
  },
  'NumberRecallGame': {
    title: 'Number Recall Easy',
    description: 'Test your memory by memorizing and recalling sequences of numbers.',
    instructions: 'Memorize the sequence of numbers shown, then tap them in the correct order. Each correct answer gives you +5 points!'
  },
  'ReactionTapGame': {
    title: 'Reaction Tap Easy',
    description: 'Test your reaction time and focus by tapping circles as quickly as possible.',
    instructions: 'Tap the circles as quickly as possible when they appear. Each correct tap gives you +5 points!'
  },
  'OddOneOutGame': {
    title: 'Odd One Out Easy',
    description: 'Test your pattern recognition by finding the item that doesn\'t belong.',
    instructions: 'Look at the items and find the one that doesn\'t belong with the others. Each correct answer gives you +5 points!'
  },
  'CreativityEasyGame': {
    title: 'Creativity Easy',
    description: 'Test your creative thinking by generating unique ideas and solutions.',
    instructions: 'Think creatively and come up with unique ideas. Each creative response gives you +5 points!'
  },
  'VerbalEasyGame': {
    title: 'Verbal Easy',
    description: 'Test your verbal skills and word knowledge.',
    instructions: 'Complete the verbal tasks and word puzzles. Each correct answer gives you +5 points!'
  },
  'VisualEasyGame': {
    title: 'Visual Easy',
    description: 'Test your visual processing and pattern recognition skills.',
    instructions: 'Complete the visual tasks and pattern recognition challenges. Each correct answer gives you +5 points!'
  },
  'FocusMediumGame': {
    title: 'Focus Medium',
    description: 'Test your focus and attention by counting the number of red circles that flash while ignoring blue distractors.',
    instructions: 'Watch carefully! Some circles will flash red (and some blue). Count how many red circles flashed. Each correct answer gives you +10 points!'
  },
  'GridPatternMemoryGame': {
    title: 'Grid Pattern Memory',
    description: 'Test your memory by memorizing patterns on a grid and reproducing them.',
    instructions: 'Memorize the pattern shown on the grid, then tap the cells to reproduce it. Each correct answer gives you +10 points!'
  },
  'PatternSequenceGame': {
    title: 'Pattern Sequence',
    description: 'Test your pattern recognition by identifying the next number in a sequence.',
    instructions: 'Look at the sequence and identify the pattern to find the next number. Each correct answer gives you +10 points!'
  },
  'SequenceTapMediumGame': {
    title: 'Sequence Tap Medium',
    description: 'Test your memory by watching a sequence of circles and then tapping them in the same order.',
    instructions: 'Watch the sequence of circles, then tap them in the same order. Each correct step gives you +10 points!'
  },
  'FocusHardGame': {
    title: 'Focus Hard',
    description: 'Test your memory and focus by memorizing a sequence of grid positions and tapping them in the correct order.',
    instructions: 'Memorize the sequence of highlighted cells. After the sequence finishes, tap the cells in the same order. Each correct step gives you +15 points!'
  },
  'MiniSudokuGame': {
    title: 'Mini Sudoku',
    description: 'Test your logic and problem-solving skills with a mini Sudoku puzzle.',
    instructions: 'Fill in the missing numbers following Sudoku rules. Each correct number gives you +15 points!'
  },
  'SequenceRecallGame': {
    title: 'Sequence Recall',
    description: 'Test your memory by memorizing and recalling complex sequences.',
    instructions: 'Memorize the sequence shown, then reproduce it exactly. Each correct step gives you +15 points!'
  }
};

function fixGameFile(filePath, difficulty) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.tsx');
    const gameInfo = GAME_INFO[fileName];
    
    if (!gameInfo) {
      console.log(`Skipping ${fileName} - no configuration found`);
      return;
    }

    // Add GameHeader import if not present
    if (!content.includes('import GameHeader')) {
      content = content.replace(
        /import { useTheme } from '\.\.\/\.\.\/\.\.\/\.\.\/components\/ThemeContext';/,
        `import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';`
      );
    }

    // Replace old header patterns with GameHeader
    const patterns = [
      // Pattern 1: TouchableOpacity exit button
      /<TouchableOpacity style=\{[^}]*exitBtn[^}]*\} onPress=\{([^}]+)\}>[\s\S]*?<\/TouchableOpacity>/,
      // Pattern 2: Simple back button
      /<TouchableOpacity[^>]*onPress=\{([^}]+)\}[^>]*>[\s\S]*?arrow-back[\s\S]*?<\/TouchableOpacity>/,
      // Pattern 3: Exit button with arrow
      /<TouchableOpacity[^>]*exitBtn[^>]*>[\s\S]*?<\/TouchableOpacity>/
    ];

    patterns.forEach(pattern => {
      const match = content.match(pattern);
      if (match) {
        const onBackFunction = match[1] || '() => {}';
        const gameHeaderComponent = `<GameHeader
        onBack={${onBackFunction}}
        gameTitle="${gameInfo.title}"
        gameDescription="${gameInfo.description}"
        gameInstructions="${gameInfo.instructions}"
      />`;
        
        content = content.replace(match[0], gameHeaderComponent);
      }
    });

    // Remove old exit button styles
    content = content.replace(/  exitBtn: \{[\s\S]*?\},?\n/g, '');
    content = content.replace(/  exitArrow: \{[\s\S]*?\},?\n/g, '');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${fileName}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function fixAllGames() {
  const gamesDir = path.join(__dirname, '..', 'app', '(tabs)', 'games');
  
  // Fix easy games
  const easyDir = path.join(gamesDir, 'easy');
  if (fs.existsSync(easyDir)) {
    const easyFiles = fs.readdirSync(easyDir).filter(file => file.endsWith('.tsx'));
    easyFiles.forEach(file => {
      fixGameFile(path.join(easyDir, file), 'easy');
    });
  }

  // Fix medium games
  const mediumDir = path.join(gamesDir, 'medium');
  if (fs.existsSync(mediumDir)) {
    const mediumFiles = fs.readdirSync(mediumDir).filter(file => file.endsWith('.tsx'));
    mediumFiles.forEach(file => {
      fixGameFile(path.join(mediumDir, file), 'medium');
    });
  }

  // Fix hard games
  const hardDir = path.join(gamesDir, 'hard');
  if (fs.existsSync(hardDir)) {
    const hardFiles = fs.readdirSync(hardDir).filter(file => file.endsWith('.tsx'));
    hardFiles.forEach(file => {
      fixGameFile(path.join(hardDir, file), 'hard');
    });
  }

  console.log('All game headers fixed!');
}

fixAllGames();






const fs = require('fs');
const path = require('path');

// Game configurations
const GAME_CONFIGS = {
  easy: {
    xpPerCorrect: 5,
    xpReward: 25,
    difficulty: 'easy'
  },
  medium: {
    xpPerCorrect: 10,
    xpReward: 40,
    difficulty: 'medium'
  },
  hard: {
    xpPerCorrect: 15,
    xpReward: 50,
    difficulty: 'hard'
  }
};

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

function updateGameFile(filePath, difficulty) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.tsx');
    const gameInfo = GAME_INFO[fileName];
    const config = GAME_CONFIGS[difficulty];
    
    if (!gameInfo || !config) {
      console.log(`Skipping ${fileName} - no configuration found`);
      return;
    }

    // Add GameHeader import
    if (!content.includes('import GameHeader')) {
      content = content.replace(
        /import { useTheme } from '\.\.\/\.\.\/\.\.\/\.\.\/components\/ThemeContext';/,
        `import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';`
      );
    }

    // Add XP constants
    if (!content.includes('XP_PER_CORRECT')) {
      const xpRewardMatch = content.match(/const XP_REWARD = \d+;/);
      if (xpRewardMatch) {
        content = content.replace(
          xpRewardMatch[0],
          `const XP_PER_CORRECT = ${config.xpPerCorrect}; // ${difficulty} games: +${config.xpPerCorrect} points per correct answer
const XP_REWARD = ${config.xpReward}; // Bonus for completing the game`
        );
      }
    }

    // Replace header with GameHeader component
    const headerPattern = /<TouchableOpacity style={\[styles\.exitBtn[^}]*\]} onPress={[^}]*}>[\s\S]*?<\/TouchableOpacity>/;
    const headerMatch = content.match(headerPattern);
    
    if (headerMatch) {
      const gameHeaderComponent = `<GameHeader
        onBack={handleExit}
        gameTitle="${gameInfo.title}"
        gameDescription="${gameInfo.description}"
        gameInstructions="${gameInfo.instructions}"
      />`;
      
      content = content.replace(headerMatch[0], gameHeaderComponent);
    }

    // Remove exitBtn styles
    content = content.replace(/  exitBtn: \{[\s\S]*?\},?\n/g, '');
    content = content.replace(/  exitArrow: \{[\s\S]*?\},?\n/g, '');

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${fileName}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

function updateAllGames() {
  const gamesDir = path.join(__dirname, '..', 'app', '(tabs)', 'games');
  
  // Update easy games
  const easyDir = path.join(gamesDir, 'easy');
  if (fs.existsSync(easyDir)) {
    const easyFiles = fs.readdirSync(easyDir).filter(file => file.endsWith('.tsx'));
    easyFiles.forEach(file => {
      updateGameFile(path.join(easyDir, file), 'easy');
    });
  }

  // Update medium games
  const mediumDir = path.join(gamesDir, 'medium');
  if (fs.existsSync(mediumDir)) {
    const mediumFiles = fs.readdirSync(mediumDir).filter(file => file.endsWith('.tsx'));
    mediumFiles.forEach(file => {
      updateGameFile(path.join(mediumDir, file), 'medium');
    });
  }

  // Update hard games
  const hardDir = path.join(gamesDir, 'hard');
  if (fs.existsSync(hardDir)) {
    const hardFiles = fs.readdirSync(hardDir).filter(file => file.endsWith('.tsx'));
    hardFiles.forEach(file => {
      updateGameFile(path.join(hardDir, file), 'hard');
    });
  }

  console.log('All games updated successfully!');
}

updateAllGames();






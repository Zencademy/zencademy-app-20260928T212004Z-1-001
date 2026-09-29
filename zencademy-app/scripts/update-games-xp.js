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

function addXPConstants(content, difficulty) {
  const config = GAME_CONFIGS[difficulty];
  
  // Check if XP constants already exist
  if (content.includes('XP_PER_CORRECT')) {
    return content;
  }
  
  // Find where to add the constants (after other const declarations)
  const constMatch = content.match(/(const [^=]+ = [^;]+;[\s\S]*?)(?=function|export|const [A-Z])/);
  if (constMatch) {
    const constants = constMatch[1];
    const newConstants = constants + `const XP_PER_CORRECT = ${config.xpPerCorrect}; // ${difficulty} games: +${config.xpPerCorrect} points per correct answer
const XP_REWARD = ${config.xpReward}; // Bonus for completing the game
`;
    content = content.replace(constants, newConstants);
  } else {
    // Fallback: add after imports
    const importMatch = content.match(/(import [^;]+;[\s\S]*?)(?=const|function|export)/);
    if (importMatch) {
      const imports = importMatch[1];
      const newImports = imports + `const XP_PER_CORRECT = ${config.xpPerCorrect}; // ${difficulty} games: +${config.xpPerCorrect} points per correct answer
const XP_REWARD = ${config.xpReward}; // Bonus for completing the game

`;
      content = content.replace(imports, newImports);
    }
  }
  
  return content;
}

function updateGameFile(filePath, difficulty) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.tsx');
    
    // Add XP constants
    content = addXPConstants(content, difficulty);
    
    // Add GameHeader import if not present
    if (!content.includes('import GameHeader')) {
      content = content.replace(
        /import { useTheme } from '\.\.\/\.\.\/\.\.\/\.\.\/components\/ThemeContext';/,
        `import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';`
      );
    }

    // Replace header with GameHeader component
    const headerPattern = /<TouchableOpacity style={\[styles\.exitBtn[^}]*\]} onPress={[^}]*}>[\s\S]*?<\/TouchableOpacity>/;
    const headerMatch = content.match(headerPattern);
    
    if (headerMatch) {
      const gameHeaderComponent = `<GameHeader
        onBack={handleExit}
        gameTitle="${fileName.replace('Game', '')}"
        gameDescription="Test your cognitive abilities with this challenging game."
        gameInstructions="Follow the instructions carefully. Each correct answer gives you +${GAME_CONFIGS[difficulty].xpPerCorrect} points!"
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

  console.log('All games updated with XP constants!');
}

updateAllGames();






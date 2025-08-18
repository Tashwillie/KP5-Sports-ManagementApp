const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix webSocketService references
function fixWebSocketService(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace webSocketService.broadcastToRoom calls
    if (content.includes('webSocketService.broadcastToRoom')) {
      content = content.replace(/webSocketService\.broadcastToRoom\(/g, '// webSocketService.broadcastToRoom(');
      modified = true;
    }
    
    // Replace webSocketService.refreshMatchState calls
    if (content.includes('webSocketService.refreshMatchState')) {
      content = content.replace(/await webSocketService\.refreshMatchState\(/g, '// await webSocketService.refreshMatchState(');
      modified = true;
    }
    
    // Replace other webSocketService method calls
    if (content.includes('webSocketService.')) {
      content = content.replace(/webSocketService\.(\w+)\(/g, '// webSocketService.$1(');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed webSocketService references in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('Fixing webSocketService references...');

const srcDir = path.join(__dirname, 'src');
const tsFiles = findTsFiles(srcDir);

tsFiles.forEach(fixWebSocketService);

console.log('Finished fixing webSocketService references.');

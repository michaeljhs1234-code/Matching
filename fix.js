const fs = require('fs');
const path = require('path');

function fixFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    let newContent = content
        .replace(/"\/auth\/login"/g, '"/login"')
        .replace(/'\/auth\/login'/g, "'/login'")
        .replace(/`\/auth\/login`/g, "`/login`")
        .replace(/'\/auth\/login\?/g, "'/login?")
        .replace(/`\/auth\/login\?/g, "`/login?")
        .replace(/"\/auth\/signup"/g, '"/signup"')
        .replace(/'\/auth\/signup'/g, "'/signup'")
        .replace(/"\/auth\/verify"/g, '"/verify"')
        .replace(/'\/auth\/verify'/g, "'/verify'")
        .replace(/"\/auth\/signout"/g, '"/signout"')
        .replace(/'\/auth\/signout'/g, "'/signout'");
    
    if (content !== newContent) {
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log(`Updated ${filepath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            fixFile(fullPath);
        }
    }
}

walk('c:/Users/micha/OneDrive/바탕 화면/시분설/matching/app');
fixFile('c:/Users/micha/OneDrive/바탕 화면/시분설/matching/proxy.ts');

import os
import glob

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace('"/auth/login"', '"/login"')
    new_content = new_content.replace("'/auth/login'", "'/login'")
    new_content = new_content.replace('`/auth/login`', '`/login`')
    new_content = new_content.replace("'/auth/login?", "'/login?")
    new_content = new_content.replace('`/auth/login?', '`/login?')
    
    new_content = new_content.replace('"/auth/signup"', '"/signup"')
    new_content = new_content.replace("'/auth/signup'", "'/signup'")
    
    new_content = new_content.replace('"/auth/verify"', '"/verify"')
    new_content = new_content.replace("'/auth/verify'", "'/verify'")
    
    new_content = new_content.replace('"/auth/signout"', '"/signout"')
    new_content = new_content.replace("'/auth/signout'", "'/signout'")
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('c:/Users/micha/OneDrive/바탕 화면/시분설/matching/app'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

fix_file('c:/Users/micha/OneDrive/바탕 화면/시분설/matching/proxy.ts')

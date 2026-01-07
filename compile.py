import os
import re

# Directory to search for files
directory = './dist/'

# File extensions to process
file_extensions = ['.html', '.ts', '.js', '.css', '.xml', '.json']

# Pattern to replace
pattern = r'\./src/'
replacement = './'

# Loop through all files in the directory
for root, _, files in os.walk(directory):
    for file in files:
        if any(file.endswith(ext) for ext in file_extensions):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace occurrences of the pattern
            updated_content = re.sub(pattern, replacement, content)
            
            # Write back the updated content if changes were made
            if content != updated_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(updated_content)
                # Replace occurrences of '/assets/' with './assets/'^
                updated_content = re.sub(r'/assets/', './assets/', updated_content)
                
                # Write back the updated content if changes were made
                if content != updated_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                
                print(f"Updated: {file_path}")
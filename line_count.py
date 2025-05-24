import os

def get_lines_and_characters(directory, extensions=None):
    total_files = 0
    total_lines = 0
    total_characters = 0

    for root, dirs, files in os.walk(directory):
        # Exclude node_modules from the search
        if 'node_modules' in dirs:
            dirs.remove('node_modules')  # Prevents descending into node_modules

        for file in files:
            # Exclude files with "bootstrap" in their name and ending in .js or .css
            if ("bootstrap" in file.lower() and (file.endswith('.js') or file.endswith('.css'))):
                continue
            # Exclude files not matching the extensions
            if extensions and not file.endswith(tuple(extensions)):
                continue

            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    print(file_path)
                    lines = f.readlines()
                    total_files += 1
                    total_lines += len(lines)
                    total_characters += sum(len(line) for line in lines)
            except (UnicodeDecodeError, FileNotFoundError) as e:
                print(f"Skipping {file_path}: {e}")
            except Exception as e:
                print(e)

    return total_files, total_lines, total_characters

# Directory of your source code
source_directory = "./../Final Project"

# Specify file extensions to include (e.g., '.cpp', '.h', etc.)
file_extensions = ['.ejs', '.js', '.cjs', '.html', '.css', '.scss']

files, lines, characters = get_lines_and_characters(source_directory, file_extensions)

print(f"Total files: {files}")
print(f"Total lines: {lines}")
print(f"Total characters: {characters}")
os.system("pause")

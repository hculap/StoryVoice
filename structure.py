import os

OUTPUT_FILENAME = "directory_scan.txt"

# Directories to exclude (add more if needed)
EXCLUDED_DIRS = {"node_modules", "venv", ".venv", "env", "__pycache__", ".git"}

# Files to exclude explicitly by name
EXCLUDED_FILES = {".env"}

# Define which extensions we consider as text files
TEXT_EXTENSIONS = {".txt", ".md", ".py", ".js", ".json", ".html", ".css", ".csv"}

def build_directory_tree(root_dir):
    """
    Builds a string representation of the directory tree starting from root_dir.
    Skips any directory in EXCLUDED_DIRS.
    """
    tree_lines = []
    for current_path, dirs, files in os.walk(root_dir):
        # Remove excluded directories so we don't even traverse them
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        # Calculate indentation based on directory depth
        depth = current_path.count(os.sep) - root_dir.count(os.sep)
        indent = "    " * depth

        # Current folder name (handle case where basename might be empty)
        folder_name = os.path.basename(current_path) if os.path.basename(current_path) else current_path
        tree_lines.append(f"{indent}[{folder_name}]/")

        # List files in the current folder
        for f in files:
            # Skip excluded files
            if f in EXCLUDED_FILES:
                continue
            tree_lines.append(f"{indent}    {f}")

    return "\n".join(tree_lines)

def is_text_file(filepath):
    """
    Checks if a file is considered a text file based on its extension.
    """
    _, extension = os.path.splitext(filepath)
    return extension.lower() in TEXT_EXTENSIONS

def get_file_content(filepath):
    """
    Safely reads text content from a file (assuming UTF-8).
    Returns an empty string if it fails to read.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except:
        return ""

def main():
    current_dir = os.getcwd()

    # 1. Build the directory structure map (skipping EXCLUDED_DIRS and EXCLUDED_FILES)
    directory_map = build_directory_tree(current_dir)

    # 2. Gather contents of each text file (excluding sensitive files, and skipping excluded directories)
    file_contents = []
    for root, dirs, files in os.walk(current_dir):
        # Remove excluded directories from traversal
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        for f in files:
            # Skip excluded files
            if f in EXCLUDED_FILES:
                continue

            file_path = os.path.join(root, f)
            # Check if it's a text file by extension
            if is_text_file(file_path):
                content = get_file_content(file_path)
                file_block = [
                    "##############################",
                    f"{file_path}:",  # you can also just show the filename
                    "\"",
                    content,
                    "\"",
                    "##############################"
                ]
                file_contents.append("\n".join(file_block))

    # Combine everything into a single result
    final_output = []
    final_output.append("==== DIRECTORY STRUCTURE ====\n")
    final_output.append(directory_map)
    final_output.append("\n\n==== TEXT FILE CONTENTS ====\n")
    final_output.append("\n\n".join(file_contents))

    # Write the combined result to the output file
    with open(OUTPUT_FILENAME, "w", encoding="utf-8") as out_file:
        out_file.write("\n".join(final_output))

    print(f"Directory scan complete. See '{OUTPUT_FILENAME}' for results.")

if __name__ == "__main__":
    main()
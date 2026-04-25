import os
import re

root_dir = "/home/kubrick/www/estudIA"

def get_relative_path(from_file, to_absolute_path):
    # to_absolute_path is something like /.agents/experts/philosopher.md
    # We want to make it relative to from_file
    
    # Remove the leading / if it's there
    if to_absolute_path.startswith("/"):
        to_absolute_path = to_absolute_path[1:]
    
    # Absolute path of the target
    target_abs = os.path.join(root_dir, to_absolute_path)
    
    # Absolute directory of the current file
    current_dir = os.path.dirname(from_file)
    
    # Get relative path
    rel_path = os.path.relpath(target_abs, current_dir)
    return rel_path

def convert_links_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern for [text](/path) or ![alt](/path)
    # Also handle file:///home/kubrick/www/estudIA/
    
    def replace_link(match):
        prefix = match.group(1) # [text]( or ![alt](
        link = match.group(2)   # the path
        suffix = match.group(3) # )
        
        # Check if it's a project link
        original_link = link
        if link.startswith("file:///home/kubrick/www/estudIA/"):
            link = link.replace("file:///home/kubrick/www/estudIA/", "/")
        
        if link.startswith("/"):
            try:
                new_rel_path = get_relative_path(file_path, link)
                print(f"File: {os.path.basename(file_path)} | Converted: {original_link} -> {new_rel_path}")
                return f"{prefix}{new_rel_path}{suffix}"
            except Exception as e:
                return match.group(0)
        return match.group(0)

    # Regex to find links
    # Group 1: [text]( or ![alt](
    # Group 2: the path
    # Group 3: )
    new_content = re.sub(r'(\!?\[.*?\]\()(.+?)(\))', replace_link, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

def main():
    for root, dirs, files in os.walk(root_dir):
        if ".git" in dirs:
            dirs.remove(".git")
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                convert_links_in_file(file_path)

if __name__ == "__main__":
    main()

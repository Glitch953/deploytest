import re

# Define color mappings
replacements = {
    '#0f172a': 'primary',         # Dark Blue Background
    '#1e293b': 'secondary',       # Lighter Blue Background / Card
    '#38bdf8': 'accent',          # Light Blue Accent
    '#0ea5e9': 'accent-hover',    # Darker Accent
    '#ffffff': 'text-primary',    # White text (careful with this one)
    '#9ca3af': 'text-secondary',  # Gray text
}

# Specific class mappings (regex patterns)
# bg-[#0f172a] -> bg-primary
# text-[#38bdf8] -> text-accent
# from-[#0f172a] -> from-primary
# to-[#0f172a] -> to-primary
# border-[#38bdf8] -> border-accent
# shadow-[#38bdf8] -> shadow-accent

def refactor_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Iterate over hex codes and replace in arbitrary values
    # Pattern: class="... bg-[#0f172a] ..."
    # We look for [#{hex}]
    
    for hex_code, var_name in replacements.items():
        # Escape the hex code for regex
        escaped_hex = re.escape(hex_code)
        
        # Replace arbitrary values: -[#hex] -> -varname
        # e.g. bg-[#0f172a] -> bg-primary
        # We need to handle the brackets creation
        
        # Regex to match: (bg|text|border|from|to|shadow|via|decoration|ring|outline)-\[#hex_code\]
        pattern = r'\b(bg|text|border|from|to|shadow|via|decoration|ring|outline)-\[' + escaped_hex + r'\]'
        
        def replace_match(match):
            prefix = match.group(1)
            # Special case for text-white -> text-primary assignment might be weird if logic dictates otherwise
            # But let's stick to the plan.
            # However, text-white is usually static white. text-[#ffffff] is rare.
            # text-gray-400 is text-secondary.
            
            return f"{prefix}-{var_name}"
            
        content = re.sub(pattern, replace_match, content)

        # Also replace text-white with text-primary? 
        # No, 'text-white' is a utility class. We defined 'text-primary' in config.
        # But 'text-white' stays white in light mode? No, usually text needs to invert.
        # But buttons with blue background usually keep white text.
        # Global text (body) is usually text-primary.
        # I'll leave 'text-white' alone for now as it's often used on dark backgrounds (buttons).
        # We'll focus on the specific arbitrary values which defined the THEME.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

refactor_file('c:\\Users\\ac\\Desktop\\EYF-website-main\\index.html')
refactor_file('c:\\Users\\ac\\Desktop\\EYF-website-main\\about.html')
print("Refactoring complete.")

import re

filepath = 'c:\\Users\\ac\\Desktop\\EYF-website-main\\about.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the SPA scripts and replace until the end
# We look for the "Pages Data" comment or the start of the script block after notification-container
# Pattern: <div id="notification-container"></div> ... <script>

# We want to keep notification-container
# We want to replace everything after it with the simple script

split_marker = '<div id="notification-container"></div>'
parts = content.split(split_marker)

if len(parts) > 1:
    new_content = parts[0] + split_marker + '''
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            applyTheme(currentTheme);
            applyLanguage(currentLang);
            // Ensure static links are used
        });
    </script>
</body>
</html>
'''
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully fixed about.html")
else:
    print("Could not find split marker in about.html")

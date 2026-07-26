import os
import re

open_next_dir = "apps/ud-trust/.open-next"
builtins = ["http", "https", "zlib", "worker_threads", "crypto", "fs", "path", "os", "stream", "util", "url", "events", "buffer"]

print("Starting to patch Node.js built-in imports in .open-next...")

for root, dirs, files in os.walk(open_next_dir):
    for file in files:
        if file.endswith(".js") or file.endswith(".mjs"):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f_in:
                    content = f_in.read()
                
                original = content
                for b in builtins:
                    # Replace require("builtin") and require('builtin')
                    content = re.sub(rf'require\((["']){b}(["'])\)', rf'require(\1node:{b}\2)', content)
                    # Replace from "builtin" and from 'builtin'
                    content = re.sub(rf'from\s+(["']){b}(["'])', rf'from \1node:{b}\2', content)
                    # Replace import("builtin") and import('builtin')
                    content = re.sub(rf'import\((["']){b}(["'])\)', rf'import(\1node:{b}\2)', content)
                
                if content != original:
                    with open(filepath, "w", encoding="utf-8") as f_out:
                        f_out.write(content)
                    print(f"Patched: {filepath}")
            except Exception as e:
                print(f"Failed to patch {filepath}: {e}")

print("Import patching complete!")

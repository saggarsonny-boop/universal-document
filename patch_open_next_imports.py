import os
import re

open_next_dir = "apps/ud-trust/.open-next"
builtins = ["http", "https", "zlib", "worker_threads", "crypto", "fs", "path", "os", "stream", "util", "url", "events", "buffer", "async_hooks", "vm"]

print("Starting to patch Node.js built-in imports in .open-next...")

# Prepend require polyfill to the main worker entrypoint
worker_path = "apps/ud-trust/.open-next/worker.js"
if os.path.exists(worker_path):
    try:
        with open(worker_path, "r", encoding="utf-8") as f_wk:
            w_content = f_wk.read()
        
        polyfill_js = """import * as __poly_http from 'node:http';
import * as __poly_https from 'node:https';
import * as __poly_zlib from 'node:zlib';
import * as __poly_worker_threads from 'node:worker_threads';
import * as __poly_crypto from 'node:crypto';
import * as __poly_fs from 'node:fs';
import * as __poly_path from 'node:path';
import * as __poly_os from 'node:os';
import * as __poly_stream from 'node:stream';
import * as __poly_util from 'node:util';
import * as __poly_url from 'node:url';
import * as __poly_events from 'node:events';
import * as __poly_buffer from 'node:buffer';
import * as __poly_async_hooks from 'node:async_hooks';
import * as __poly_vm from 'node:vm';

const __poly_mapping = {
  'http': __poly_http, 'node:http': __poly_http,
  'https': __poly_https, 'node:https': __poly_https,
  'zlib': __poly_zlib, 'node:zlib': __poly_zlib,
  'worker_threads': __poly_worker_threads, 'node:worker_threads': __poly_worker_threads,
  'crypto': __poly_crypto, 'node:crypto': __poly_crypto,
  'fs': __poly_fs, 'node:fs': __poly_fs,
  'path': __poly_path, 'node:path': __poly_path,
  'os': __poly_os, 'node:os': __poly_os,
  'stream': __poly_stream, 'node:stream': __poly_stream,
  'util': __poly_util, 'node:util': __poly_util,
  'url': __poly_url, 'node:url': __poly_url,
  'events': __poly_events, 'node:events': __poly_events,
  'buffer': __poly_buffer, 'node:buffer': __poly_buffer,
  'async_hooks': __poly_async_hooks, 'node:async_hooks': __poly_async_hooks,
  'vm': __poly_vm, 'node:vm': __poly_vm
};

globalThis.require = function(mod) {
  if (mod in __poly_mapping) return __poly_mapping[mod];
  throw new Error('Dynamic require of ' + mod + ' is not supported by polyfill');
};
"""
        if "globalThis.require" not in w_content:
            with open(worker_path, "w", encoding="utf-8") as f_wk:
                f_wk.write(polyfill_js + "\n" + w_content)
            print("Prepended global require polyfill to worker.js successfully!")
    except Exception as e:
        print(f"Failed to prepend polyfill to worker.js: {e}")

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
                    content = re.sub(r"""require\((["'])""" + b + r"""(["'])\)""", r"""require(\1node:""" + b + r"""\2)""", content)
                    # Replace from "builtin" and from 'builtin'
                    content = re.sub(r"""from\s+(["'])""" + b + r"""(["'])""", r"""from \1node:""" + b + r"""\2""", content)
                    # Replace import("builtin") and import('builtin')
                    content = re.sub(r"""import\((["'])""" + b + r"""(["'])\)""", r"""import(\1node:""" + b + r"""\2)""", content)
                
                if content != original:
                    with open(filepath, "w", encoding="utf-8") as f_out:
                        f_out.write(content)
                    print(f"Patched: {filepath}")
            except Exception as e:
                print(f"Failed to patch {filepath}: {e}")

print("Import patching complete!")

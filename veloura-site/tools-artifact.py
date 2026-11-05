"""Prepares dist/ for publishing as a claude.ai artifact: the host wraps the page in its own
document, so index.html is reduced to head content + body content. Writes artifact/ and files.json."""
import os, re, json, shutil
src, dst = 'dist', 'artifact'
shutil.rmtree(dst, ignore_errors=True)
shutil.copytree(src, dst)
html = open(f'{dst}/index.html', encoding='utf-8').read()
head = re.search(r'<head>([\s\S]*?)</head>', html).group(1)
body = re.search(r'<body>([\s\S]*?)</body>', html).group(1)
head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', '', head)
title = re.search(r'<title>[\s\S]*?</title>', head).group(0)
head = head.replace(title, '')
boot = "<script>document.documentElement.lang='en-CA';document.documentElement.dataset.world='noir';</script>"
open(f'{dst}/index.html', 'w', encoding='utf-8').write('<title>Veloura Boutique</title>\n' + boot + head + body)
files = {}
for dp, _, fs in os.walk(dst):
    for f in fs:
        rel = os.path.relpath(os.path.join(dp, f), dst)
        if rel != 'index.html': files[rel] = os.path.abspath(os.path.join(dp, f))
json.dump(files, open('artifact-files.json', 'w'), indent=0)
print(len(files), 'files')

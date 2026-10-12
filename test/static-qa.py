#!/usr/bin/env python3
"""Dependency-free local-page, asset, hash, metadata and translation-contract QA."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

parser = argparse.ArgumentParser()
parser.add_argument('--root', default=str(Path(__file__).resolve().parent.parent))
parser.add_argument('--out')
args = parser.parse_args()
root = Path(args.root).resolve()

class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.elements = []
        self.ids = []
        self.inline_json = []
        self.current_json = None
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        self.elements.append((tag, data))
        if data.get('id'):
            self.ids.append(data['id'])
        if tag == 'script' and data.get('type') == 'application/ld+json':
            self.current_json = ''
    def handle_data(self, data):
        if self.current_json is not None:
            self.current_json += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.current_json is not None:
            self.inline_json.append(self.current_json)
            self.current_json = None

pages = {p: Document(p.read_text()) for p in [root / 'index.html', *sorted((root / 'pages').glob('*.html'))]}
issues = []
checks = []

def check(ok, message, file):
    checks.append({'status': 'passed' if ok else 'failed', 'check': message, 'file': str(file.relative_to(root))})
    if not ok:
        issues.append(checks[-1])

for page, doc in pages.items():
    rel = page.relative_to(root)
    check(len(doc.ids) == len(set(doc.ids)), 'All IDs are unique', page)
    html = next((attrs for tag, attrs in doc.elements if tag == 'html'), {})
    check(html.get('lang') == 'he' and html.get('dir') == 'rtl', 'Authored Hebrew/RTL default', page)
    check(sum(tag == 'main' for tag, _ in doc.elements) == 1, 'Exactly one main landmark', page)
    check(sum(tag == 'h1' for tag, _ in doc.elements) == 1, 'Exactly one H1', page)
    check(any(tag == 'meta' and attrs.get('name') == 'viewport' for tag, attrs in doc.elements), 'Viewport metadata exists', page)
    for payload in doc.inline_json:
        try:
            json.loads(payload)
            check(True, 'Structured data is valid JSON', page)
        except ValueError:
            check(False, 'Structured data is valid JSON', page)
    for tag, attrs in doc.elements:
        if tag == 'img':
            check('alt' in attrs, 'Image declares alt: ' + str(attrs.get('src')), page)
        if tag == 'a' and attrs.get('target') == '_blank':
            check(bool(set((attrs.get('rel') or '').split()) & {'noopener', 'noreferrer'}), 'New-tab link has safe rel: ' + str(attrs.get('href')), page)
        if 'data-en' in attrs:
            check(bool(attrs['data-en']), 'English text exists for translated element', page)
        for attr in (['href'] if tag in ('a', 'link') else ['src'] if tag in ('script', 'img', 'video', 'source') else []):
            value = attrs.get(attr)
            if value is None:
                continue
            parsed = urlsplit(value)
            if parsed.scheme or parsed.netloc or not value or value.startswith('data:'):
                continue
            target = (root / unquote(parsed.path).lstrip('/')) if parsed.path.startswith('/') else (page.parent / unquote(parsed.path)) if parsed.path else page
            if target.is_dir():
                target = target / 'index.html'
            target = target.resolve()
            check(target.is_file(), 'Local target exists: ' + value, page)
            if target.is_file() and parsed.fragment:
                destination = pages.get(target)
                if destination is None and target.suffix == '.html':
                    destination = Document(target.read_text())
                if destination:
                    if parsed.fragment == 'fit-check':
                        found = any(t == 'script' and (a.get('src') or '').endswith('fit-check.js') for t, a in destination.elements)
                    else:
                        found = unquote(parsed.fragment) in destination.ids
                    check(found, 'Hash target exists: ' + value, page)

for css in root.glob('*.css'):
    for url in re.findall(r'url\([\'\"]?([^\)\'\"]+)', css.read_text()):
        if urlsplit(url).scheme or url.startswith('//') or url.startswith('#'):
            continue
        check((css.parent / url).resolve().is_file(), 'CSS resource exists: ' + url, css)

index = pages[root / 'index.html']
for script in ['lang.js', 'script.js', 'accessibility.js', 'fit-check.js']:
    check(any(tag == 'script' and attrs.get('src') == script for tag, attrs in index.elements), 'Interaction handler included: ' + script, root / 'index.html')
for lang in ['he', 'en']:
    check(any(tag == 'button' and attrs.get('data-lang') == lang and 'lang-opt' in attrs.get('class', '').split() for tag, attrs in index.elements), 'Language control exists: ' + lang, root / 'index.html')

result = {'root': str(root), 'pages': len(pages), 'passed': len(checks) - len(issues), 'failed': len(issues), 'checks': checks, 'issues': issues}
if args.out:
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: v for k, v in result.items() if k != 'checks'}, ensure_ascii=False, indent=2))
sys.exit(bool(issues))

"""
Blog content linter — prevent the bug class that ate 15h of prod
deploys on 2026-05-12.

Two failure modes the linter catches:
  1. Raw `<N` or `<word` in MDX that the Turbopack JSX parser will
     try to read as element-start ("Unexpected character `1` (U+0031)
     before name").
  2. Embedded double quotes in YAML string values that close the
     string early ("Wondering "is X" → 3 strings, not one).

Run before commit:
    py pc-bottleneck-analyzer/scripts/lint-blog-content.py

CI: add to .github/workflows/lint-blog.yml (or local pre-commit hook).

Exits 0 if clean, 1 if any issues found.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml  # type: ignore

HERE = Path(__file__).resolve().parent
BLOG_DIR = HERE.parent / "src" / "content" / "blog"


def lint_yaml_frontmatter(path: Path) -> list[str]:
    """Validate the YAML frontmatter parses. Catches embedded-quote bugs."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return []
    parts = text.split("---", 2)
    if len(parts) < 3:
        return [f"{path.name}: malformed frontmatter (missing closing '---')"]
    fm = parts[1]
    try:
        yaml.safe_load(fm)
        return []
    except yaml.YAMLError as e:
        # Find line in source
        line_info = ""
        if hasattr(e, "problem_mark") and e.problem_mark:
            ln = e.problem_mark.line + 1
            line_info = f" at frontmatter line {ln}"
        return [f"{path.name}: YAML parse error{line_info}: {str(e).splitlines()[0]}"]


def lint_mdx_body(path: Path) -> list[str]:
    """Detect raw `<N` (where N is a digit) or `<word` that isn't a valid
    JSX element start. MDX 2+ requires the character after `<` to start a
    valid JSX/JavaScript identifier (letter, $, or _)."""
    text = path.read_text(encoding="utf-8")
    issues = []
    # Strip code blocks so we don't false-positive on bash/jsx snippets
    body_no_code = re.sub(r"```[\s\S]*?```", "", text)
    body_no_inline = re.sub(r"`[^`]*`", "", body_no_code)
    # Pattern: < followed by something that's not letter, $, _, !, /, or whitespace
    # In a context where it's not preceded by a letter (which would be HTML-ish)
    # Pattern catches: <1, <2, <0.5%, <=, <-, etc.
    for m in re.finditer(r"\B<([0-9=\-])", body_no_inline):
        # Find line number
        idx = m.start()
        line_num = body_no_inline.count("\n", 0, idx) + 1
        snippet = body_no_inline[max(0, idx - 30):idx + 30].replace("\n", " ").strip()
        issues.append(f"{path.name}:{line_num}: raw `<{m.group(1)}` in MDX (escape as `&lt;` or wrap in backticks): ...{snippet}...")
    return issues


def main() -> int:
    if not BLOG_DIR.exists():
        print(f"no blog dir at {BLOG_DIR}")
        return 0
    issues = []
    files = sorted(BLOG_DIR.glob("*.mdx"))
    for f in files:
        issues.extend(lint_yaml_frontmatter(f))
        issues.extend(lint_mdx_body(f))
    if issues:
        print(f"LINT FAILED — {len(issues)} issue{'s' if len(issues) != 1 else ''}:\n")
        for i in issues:
            print(f"  {i}")
        print()
        print("Fix and re-run. Reference:")
        print("  - YAML: use single quotes when value contains double quotes,")
        print("    or escape internal quotes: \"He said \\\"hi\\\"\"")
        print("  - MDX: escape `<` as `&lt;` or wrap in backticks for inline code")
        return 1
    print(f"OK — {len(files)} blog files clean")
    return 0


if __name__ == "__main__":
    sys.exit(main())

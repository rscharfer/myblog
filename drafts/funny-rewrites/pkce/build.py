# Rebuilds pkce-tryouts.html from the Markdown drafts and the live post.
# Run from this folder: python3 build.py
import json, re, pathlib
here = pathlib.Path(__file__).parent
post = here.parents[2] / "posts/authentication/PKCE.md"

def load(path):
    t = path.read_text()
    if path == post:
        head, body = re.match(r"---\n(.*?)\n---\n(.*)", t, re.S).groups()
    else:
        head, body = t.split("\n---\n", 1)
    get = lambda k: re.search(rf"^{k}: (.*)$", head, re.M).group(1)
    return get("title"), get("subtitle"), body.strip()

meta = [("nature", "Nature doc", "Wildlife documentary"), ("noir", "Noir", "Hardboiled detective"),
        ("conan", "Conan", "In the style of Conan O’Brien"), ("burr", "Burr", "In the style of Bill Burr"),
        ("original", "Original", "The live post")]
out = []
for id, label, style in meta:
    title, subtitle, md = load(post if id == "original" else here / f"{id}.md")
    out.append(dict(id=id, label=label, style=style, title=title, subtitle=subtitle, md=md))
data = json.dumps(out, ensure_ascii=False).replace("</", "<\\/")
(here / "pkce-tryouts.html").write_text((here / "template.html").read_text().replace("/*DATA*/", data))

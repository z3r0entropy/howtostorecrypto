# Using this site offline

This site never asks for your seed phrase — and you should never enter one
on any website. The reason to use the offline copy is different: **your
backup strategy is itself sensitive information.** Where your plates live.
Who holds the sealed letter. Which vendors and locations you've
shortlisted. A live site that gets hijacked or quietly poisoned could
steer you toward weaker choices, suggest a "rehearsal" that's a phishing
flow, or read what you've already entered in your browser. A copy you
downloaded last month can't be tampered with after the fact.

## Run it locally

Modern browsers refuse to load a multi-page site straight from `file://`.
You need a tiny local web server. The bundle ships with helper scripts that
try several options:

### macOS / Linux

```sh
./serve.sh
```

Then open <http://localhost:8000>.

### Windows

Double-click `serve.bat`. Then open <http://localhost:8000>.

### Manually

Any of these work from inside the extracted folder:

```sh
python3 -m http.server 8000
# or
npx serve -p 8000 .
# or
php -S localhost:8000
```

## What you're trusting

Once extracted and loaded from `localhost`, the site runs entirely in your
browser with **no network calls at all** — fonts and all assets are
bundled inside this zip. Unplug your machine after extracting and the site
still works.

The wizard, audit, knowledge quiz, and locations browser all run in your
browser with no server involvement. Anything you enter stays in your
browser's local storage.

## When to use this

- You're working through your backup plan — picking locations, drafting
  your inheritance procedure, deciding between single-sig and multisig —
  and you'd rather not have a live, mutable site involved in those
  decisions.
- You're rehearsing a recovery and prefer not to have the live site
  watching over your shoulder.
- You want to pin the version of advice you've read once and consult it
  later, instead of relying on whatever the live site says at any given
  time.

This bundle was built from the live commit at the moment the deploy ran.
The version in your zip is whatever the site looked like the day you
downloaded it.

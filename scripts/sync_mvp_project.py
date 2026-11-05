#!/usr/bin/env python3
"""Idempotent FigSuite MVP Project v2 importer. Dry-run unless --apply.

Requires a ByMarkAllan-owned GitHub token with Projects scope; no payout or
deployment operations are performed. Do not log the token.
"""
from __future__ import annotations
import argparse, csv, json, re, shutil, subprocess, sys
from pathlib import Path

OWNER = "ByMarkAllan"
REPO = "ByMarkAllan/FigSuite"
TITLE = "FigSuite — MVP Build"
CSV_PATH = Path(__file__).resolve().parent.parent / "backlog" / "figsuite-mvp-issues.csv"
FIELDS = {
    "MVP Phase": ("G0","G1","G2","G3"),
    "Priority": ("P0","P1","P2"),
    "Workflow": ("Backlog","Ready","In Progress","Review","Verification","Blocked","Done"),
    "Size": ("1","2","3","5","8"),
}

def gh(*parts: str, json_out=False):
    cmd = ["gh", *parts]
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError("gh " + " ".join(parts[:3]) + ": " + (p.stderr or p.stdout).strip()[:360])
    return json.loads(p.stdout) if json_out else p.stdout.strip()

def rows():
    with CSV_PATH.open(encoding="utf-8-sig",newline="") as f:
        data = list(csv.DictReader(f))
    ids = [r["Issue_ID"] for r in data]
    if len(data)!=36 or len(set(ids))!=36:
        raise ValueError("Expected 36 unique MVP roadmap issues.")
    for r in data:
        if not re.fullmatch(r"FGS-\d{3}",r["Issue_ID"]) or r["Gate"] not in ("G0","G1","G2","G3"):
            raise ValueError("Invalid roadmap ID or phase")
    return data

def list_projects():
    return gh("project","list","--owner",OWNER,"--limit","100","--format","json",json_out=True).get("projects",[])

def project():
    existing=next((x for x in list_projects() if x.get("title")==TITLE),None)
    if existing is None:
        gh("project","create","--owner",OWNER,"--title",TITLE)
        existing=next((x for x in list_projects() if x.get("title")==TITLE),None)
    if existing is None: raise RuntimeError("Project missing after creation")
    number=str(existing["number"])
    details=gh("project","view",number,"--owner",OWNER,"--format","json",json_out=True)
    pid=details.get("id") or existing.get("id")
    if not pid: raise RuntimeError("Project node ID missing")
    try: gh("project","link",number,"--owner",OWNER,"--repo",REPO)
    except RuntimeError as e:
        if "already" not in str(e).lower() and "exists" not in str(e).lower(): raise
    return number,pid,details.get("url") or existing.get("url")

def field_map(number):
    return {f["name"]:f for f in gh("project","field-list",number,"--owner",OWNER,"--limit","100","--format","json",json_out=True).get("fields",[])}

def ensure_fields(number):
    known=field_map(number)
    for name,opts in FIELDS.items():
        if name not in known:
            gh("project","field-create",number,"--owner",OWNER,"--name",name,
               "--data-type","SINGLE_SELECT","--single-select-options",",".join(opts))
    return field_map(number)

def issue_urls():
    issues=gh("issue","list","-R",REPO,"--state","all","--limit","1000",
              "--json","title,url",json_out=True)
    out={}
    for issue in issues:
        m=re.match(r"^\[(FGS-\d{3})\]",issue.get("title",""))
        if m: out[m.group(1)]=issue["url"]
    return out

def item_map(number):
    obj=gh("project","item-list",number,"--owner",OWNER,"--limit","1000",
           "--format","json",json_out=True)
    out={}
    for i in obj.get("items",[]):
        url=(i.get("content") or {}).get("url") or i.get("contentUrl")
        if url: out[url]=i
    return out

def set_field(pid, iid, field, option):
    choices={x.get("name"):x.get("id") for x in (field.get("options") or [])}
    if option not in choices or not field.get("id"):
        raise RuntimeError("Missing Project field option "+field.get("name","?")+":"+option)
    gh("project","item-edit","--project-id",pid,"--id",iid,
       "--field-id",field["id"],"--single-select-option-id",choices[option])

def apply(data):
    if shutil.which("gh") is None: raise RuntimeError("GitHub CLI unavailable")
    gh("auth","status")
    login=gh("api","user","--jq",".login")
    if login.lower()!=OWNER.lower():
        raise RuntimeError("Token belongs to "+login+"; expected ByMarkAllan")
    gh("repo","view",REPO,"--json","nameWithOwner")
    n,pid,url=project()
    fields=ensure_fields(n)
    existing=issue_urls()
    items=item_map(n)
    for row in data:
        code=row["Issue_ID"]
        issue=existing.get(code)
        if not issue: raise RuntimeError("Missing approved MVP issue "+code+"; no duplicate will be created.")
        if issue in items:
            print("REUSE",code)
            continue
        new=gh("project","item-add",n,"--owner",OWNER,"--url",issue,"--format","json",json_out=True)
        iid=new.get("id") or (item_map(n).get(issue) or {}).get("id")
        if not iid: raise RuntimeError("Added "+code+" but failed to obtain item ID")
        for key,option in (("MVP Phase",row["Gate"]),("Priority",row["Priority"]),
                           ("Workflow","Backlog"),("Size",row["Size"])):
            set_field(pid,iid,fields[key],option)
        print("ADDED",code,row["Gate"],row["Priority"])
    print("PROJECT READY:",url or "https://github.com/users/ByMarkAllan/projects/"+n)
    print("Default table view and custom fields ready. Create additional board/roadmap views in GitHub UI if needed.")

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply",action="store_true")
    args=parser.parse_args()
    data=rows()
    print("FigSuite MVP",len(data),"issues; phases:",{g:sum(r["Gate"]==g for r in data) for g in ("G0","G1","G2","G3")})
    if not args.apply:
        print("DRY RUN OK — no remote changes. Use --apply with a ByMarkAllan Projects-scoped token.")
        return 0
    apply(data)
    return 0

if __name__=="__main__":
    try: sys.exit(main())
    except (RuntimeError,ValueError) as exc:
        print("SETUP BLOCKED:",exc,file=sys.stderr)
        sys.exit(1)

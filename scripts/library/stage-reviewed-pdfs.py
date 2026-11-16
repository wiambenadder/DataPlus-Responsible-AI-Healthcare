"""Copy the reviewed PDFs into the ignored library/papers input directory."""
import csv
import hashlib
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LIBRARY = ROOT / "library"


def read_csv(name):
    with (LIBRARY / name).open(encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))


def digest(path):
    with path.open("rb") as file:
        return hashlib.file_digest(file, "sha256").hexdigest()


def main():
    review = {
        row["slug"]: row for row in read_csv("mapping-review.csv")
        if row["status"] == "mapped"
    }
    pending = []
    for entry in read_csv("manifest.csv"):
        row = review.get(entry["slug"])
        if not row:
            continue  # independently added sources are staged separately
        name = entry["file"]
        if not name or name != Path(name).name or name != row["file"]:
            raise SystemExit(f"Unexpected filename for {entry['slug']}: {name}")
        src = (ROOT / row["source_path"]).resolve()
        if not src.is_relative_to(ROOT) or not src.is_file() or digest(src) != row["sha256"]:
            raise SystemExit(f"Missing or changed source: {src}")
        dest = LIBRARY / "papers" / name
        if dest.exists():
            if not dest.is_file() or digest(dest) != row["sha256"]:
                raise SystemExit(f"Refusing to overwrite different file: {dest}")
        else:
            pending.append((src, dest))
    (LIBRARY / "papers").mkdir(exist_ok=True)
    for src, dest in pending:
        with src.open("rb") as source, dest.open("xb") as target:
            shutil.copyfileobj(source, target)
    print(f"Staged {len(pending)} PDFs; existing matching copies were kept.")


if __name__ == "__main__":
    main()

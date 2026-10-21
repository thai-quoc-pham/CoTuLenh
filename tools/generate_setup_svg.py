"""Generate the initial position diagram for the cotulenh.vn community game."""

from pathlib import Path
from html import escape

OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "so-do-xep-quan-ban-dau.svg"
CELL = 100
LEFT = 72
TOP = 144
COLS = "abcdefghijk"
ROWS = range(12, 0, -1)

RED = [
    ("g1", "Chỉ huy", "CH"),
    ("b2", "Hải quân", "HQ"), ("e2", "Máy bay", "MB"),
    ("f2", "Tổng Hành Dinh", "THD"), ("h2", "Tổng Hành Dinh", "THD"),
    ("i2", "Máy bay", "MB"),
    ("d3", "Pháo", "P"), ("g3", "Tên lửa", "TL"), ("j3", "Pháo", "P"),
    ("c4", "Hải quân", "HQ"), ("e4", "Phòng không", "PK"),
    ("f4", "Xe tăng", "XT"), ("h4", "Xe tăng", "XT"),
    ("i4", "Phòng không", "PK"),
    ("c5", "Bộ binh", "BB"), ("d5", "Công binh", "CB"),
    ("g5", "Dân quân", "DQ"), ("j5", "Công binh", "CB"),
    ("k5", "Bộ binh", "BB"),
]
BLUE = [(coord[0] + str(13 - int(coord[1:])), name, abbr) for coord, name, abbr in RED]


def text(x, y, label, *, size=20, fill="#263c3a", weight=600, anchor="middle"):
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" '
            f'font-family="Arial, Helvetica, sans-serif" font-size="{size}" '
            f'font-weight="{weight}" fill="{fill}">{escape(label)}</text>')


svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1244 1544" role="img" '
    'aria-labelledby="title desc">',
    '<title id="title">Sơ đồ xếp quân ban đầu Cờ Tư Lệnh bản web</title>',
    '<desc id="desc">Bàn 11 cột a đến k, 12 hàng 1 đến 12; Xanh phía trên và Đỏ phía dưới. '
    'Mỗi bên có 19 quân tại các tọa độ ghi trong sơ đồ.</desc>',
    '<rect width="1244" height="1544" fill="#f8f5ec"/>',
    text(72, 54, "SƠ ĐỒ XẾP QUÂN BAN ĐẦU", size=29, weight=700, anchor="start"),
    text(72, 89, "Bản web cộng đồng • nhìn từ phía Đỏ • 19 quân mỗi bên", size=16, fill="#64736c", weight=400, anchor="start"),
    '<rect x="1001" y="39" width="171" height="42" rx="21" fill="#e2e7df"/>',
    text(1086, 67, "11 CỘT × 12 HÀNG", size=14, fill="#23564d", weight=700),
]

for ri, row in enumerate(ROWS):
    y = TOP + ri * CELL
    svg.append(text(42, y + 58, str(row), size=18, fill="#62736c"))
    for ci, col in enumerate(COLS):
        x = LEFT + ci * CELL
        coord = f"{col}{row}"
        fill = "#f0eee4" if (ri + ci) % 2 == 0 else "#e8e5d9"
        if col in "ab": fill = "#d2e2e3" if (ri + ci) % 2 == 0 else "#c6dadb"
        if row in (6, 7): fill = "#dce9e1" if (ri + ci) % 2 == 0 else "#d0e3d7"
        if coord in ("f6", "f7", "h6", "h7"): fill = "#d7bb80"
        svg.append(f'<rect x="{x}" y="{y}" width="{CELL}" height="{CELL}" fill="{fill}" stroke="#cbd2c7" stroke-width="1"/>')
        if coord in ("f6", "f7", "h6", "h7"):
            svg.append(text(x + 50, y + 57, "CẦU", size=16, fill="#725b2f", weight=700))
        svg.append(text(x + 9, y + 17, coord, size=11, fill="#87958d", weight=400, anchor="start"))

for ci, col in enumerate(COLS):
    svg.append(text(LEFT + ci * CELL + 50, TOP - 18, col.upper(), size=18, fill="#62736c"))
    svg.append(text(LEFT + ci * CELL + 50, TOP + 12 * CELL + 28, col.upper(), size=18, fill="#62736c"))

for side, pieces, fill, stroke in [
    ("Xanh", BLUE, "#287684", "#164d59"),
    ("Đỏ", RED, "#bb5147", "#813a33"),
]:
    for coord, name, abbr in pieces:
        ci = COLS.index(coord[0])
        row = int(coord[1:])
        cx = LEFT + ci * CELL + CELL // 2
        cy = TOP + (12 - row) * CELL + CELL // 2
        if name == "Tổng Hành Dinh":
            svg.append(f'<rect x="{cx-35}" y="{cy-35}" width="70" height="70" rx="14" fill="{fill}" stroke="{stroke}" stroke-width="4"/>')
        else:
            svg.append(f'<circle cx="{cx}" cy="{cy}" r="36" fill="{fill}" stroke="{stroke}" stroke-width="4"/>')
        if name == "Chỉ huy":
            svg.append(f'<circle cx="{cx}" cy="{cy}" r="29" fill="none" stroke="#f1ca83" stroke-width="3"/>')
        svg.append(text(cx, cy + 7, abbr, size=19 if len(abbr) < 3 else 14, fill="#fff9e9", weight=700))

svg += [
    '<rect x="72" y="1402" width="1100" height="83" rx="8" fill="#e7ebe1"/>',
    '<circle cx="108" cy="1443" r="15" fill="#287684"/>',
    text(134, 1449, "XANH: HÀNG 8–12", size=16, anchor="start", weight=700),
    '<circle cx="450" cy="1443" r="15" fill="#bb5147"/>',
    text(476, 1449, "ĐỎ: HÀNG 1–5", size=16, anchor="start", weight=700),
    '<rect x="809" y="1428" width="29" height="29" rx="5" fill="#287684"/>',
    text(850, 1449, "THD: CĂN CỨ", size=16, anchor="start", weight=700),
    '</svg>',
]
OUTPUT.write_text("\n".join(svg), encoding="utf-8")
print(f"Wrote {OUTPUT}")

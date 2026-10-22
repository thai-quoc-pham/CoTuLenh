"""Generate the initial position diagram for the cotulenh.vn community game."""

from pathlib import Path
from html import escape

OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "so-do-xep-quan-ban-dau.svg"
CELL_X = 95
CELL_Y = 81
LEFT = 135
TOP = 140
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


terrain_svg = (OUTPUT.parent / "board-terrain.svg").read_text(encoding="utf-8")
terrain_body = terrain_svg.split(">", 1)[1].rsplit("</svg>", 1)[0]
svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1220 1220" role="img" aria-labelledby="title desc">',
    '<title id="title">Sơ đồ xếp quân ban đầu Cờ Tư Lệnh</title>',
    '<desc id="desc">Quân đặt trên giao điểm của 11 cột và 12 hàng. Dải nước màu xanh ở mép trái và giữa bàn.</desc>',
    '<rect width="1220" height="1220" fill="#f8f5ec"/>',
    text(135, 55, "SƠ ĐỒ XẾP QUÂN BAN ĐẦU", size=31, weight=700, anchor="start"),
    text(135, 89, "Nhìn từ phía Đỏ • 19 quân mỗi bên • quân đứng trên giao điểm", size=16, fill="#64736c", weight=400, anchor="start"),
    f'<g transform="translate({LEFT} {TOP}) scale({CELL_X/100} {CELL_Y/100})">{terrain_body}</g>',
]

for row in ROWS:
    y = TOP + (12 - row) * CELL_Y
    svg.append(text(LEFT - 35, y + 6, str(row), size=17, fill="#62736c"))
for ci, col in enumerate(COLS):
    x = LEFT + ci * CELL_X
    svg.append(text(x, TOP - 18, col.upper(), size=17, fill="#62736c"))
    svg.append(text(x, TOP + 11 * CELL_Y + 30, col.upper(), size=17, fill="#62736c"))

for side, pieces, fill, stroke in [
    ("Xanh", BLUE, "#287684", "#164d59"),
    ("Đỏ", RED, "#bb5147", "#813a33"),
]:
    for coord, name, abbr in pieces:
        cx = LEFT + COLS.index(coord[0]) * CELL_X
        cy = TOP + (12 - int(coord[1:])) * CELL_Y
        if name == "Tổng Hành Dinh":
            svg.append(f'<rect x="{cx-27}" y="{cy-27}" width="54" height="54" rx="10" fill="{fill}" stroke="{stroke}" stroke-width="3"/>')
        else:
            svg.append(f'<circle cx="{cx}" cy="{cy}" r="27" fill="{fill}" stroke="{stroke}" stroke-width="3"/>')
        if name == "Chỉ huy":
            svg.append(f'<circle cx="{cx}" cy="{cy}" r="22" fill="none" stroke="#f1ca83" stroke-width="2"/>')
        svg.append(text(cx, cy + 6, abbr, size=15 if len(abbr) < 3 else 12, fill="#fff9e9", weight=700))

svg += [
    '<rect x="135" y="1125" width="950" height="66" rx="8" fill="#e7ebe1"/>',
    '<circle cx="171" cy="1158" r="13" fill="#287684"/>',
    text(194, 1164, "XANH: HÀNG 8–12", size=15, anchor="start", weight=700),
    '<circle cx="495" cy="1158" r="13" fill="#bb5147"/>',
    text(518, 1164, "ĐỎ: HÀNG 1–5", size=15, anchor="start", weight=700),
    '<rect x="799" y="1145" width="26" height="26" rx="5" fill="#287684"/>',
    text(838, 1164, "THD: CĂN CỨ", size=15, anchor="start", weight=700),
    '</svg>',
]
OUTPUT.write_text("\n".join(svg), encoding="utf-8")
print(f"Wrote {OUTPUT}")

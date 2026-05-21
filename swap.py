import re

with open("webinar-template/index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

# White card starts at line 567 (index 566), ends at line 679 (index 678)
white_card = lines[566:679]
# Black card starts at line 680 (index 679), ends at line 773 (index 772)
black_card = lines[679:773]

new_lines = lines[:566] + black_card + white_card + lines[773:]

with open("webinar-template/index.html", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

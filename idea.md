New Page:Editor
Updates
- file format
- draw/erase (&cursor pointer, must be symmertric)
- change color
- upload button/download

file idea (json):
{
    "size": 5,
    "colors": ["#000000", "#000000"],
    "grid": ["00010", "01000", "01010"],
}

how it works:
size -> 5 for 5x5 drawable gird, actual size 7x7

color -> index 0 is ink
index 1 is bg

grid (5x5 hcenter part) -> index 0 is line1/5, with it being 0:no, 1:colored
-> index 1 is line2/4
-> index 2 is center line
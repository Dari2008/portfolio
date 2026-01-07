import json


points = []

for x in range(50):
    for y in range(50):
        points.append([x, y])


with open("temp.json", "w") as outFile:
    json.dump({
        "points": points,
        "width": 50,
        "height": 50
    }, outFile)
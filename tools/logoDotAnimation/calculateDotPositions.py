import os
import sys
import argparse
from PIL import Image
import json

parser = argparse.ArgumentParser()
parser.add_argument("input", help="Input image", type=str)
parser.add_argument("output", help="Output json file", type=str)
parser.add_argument("threashold", help="Threashold of the brightness", type=int)
parser.add_argument("--i", help="Invert the brightness")
parser.add_argument("--w", help="Sets the witdh", type=int)
parser.add_argument("--h", help="Sets the height", type=int)
parser.add_argument("--s", help="Scales the image", type=float)

args = parser.parse_args()

inputPath = args.input
outputPath = args.output
threashold = args.threashold
invert = args.i
w = args.w
h = args.h
s = args.s

inputImage = Image.open(inputPath, "r")

if w and h:
    inputImage = inputImage.resize((w, h))
elif w:
    inputImage = inputImage.resize((w, inputImage.height))
elif h:
    inputImage = inputImage.resize((inputImage.width, h))
    
if s:
    inputImage = inputImage.resize((int(inputImage.width * s), int(inputImage.height * s)))

points = []

for x in range(0, inputImage.width):
    for y in range(0, inputImage.height):
        (r, g, b, a) = inputImage.getpixel((x, y))
        brightness = (r + g + b) / 3 * (a / (255 if a > 1 else 1))
        if brightness > threashold and not invert:
            points.append([x, y])
        elif invert:
            points.append([x, y])

if(os.path.exists(outputPath)):
    overwrite = input("Do you want to overwrite the file: " + outputPath)
    if(overwrite != "Y" and overwrite != "y"):
        exit(-1)

with open(outputPath, "w+") as file:
    json.dump({
        "points": points,
        "width": inputImage.width,
        "height": inputImage.height
    }, file)
    print("Successfully saved to: " + outputPath)

print("You need " + str(len(points)) + " dots")
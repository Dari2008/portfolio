import os
import sys
import argparse
from PIL import Image
import json
import math
import random
import operator

parser = argparse.ArgumentParser()
parser.add_argument("input", help="Input json file", type=str)
parser.add_argument("--sizeswidth", help="Sizes comma seperated", type=str)
parser.add_argument("--sizesheight", help="Sizes comma seperated", type=str)
parser.add_argument("path", help="Path relative to image element", type=str)

args = parser.parse_args()

input = args.input
pathRelativeToImgElement = args.path

sizesWidth =  [int(s) for s in args.sizeswidth.split(",")] if args.sizeswidth else None
sizesHeight = [int(s) for s in args.sizesheight.split(",")] if args.sizesheight else None


def generate_images_width(inputPath, sizesWidth):
    # load input image
    inputImage = Image.open(inputPath)

    baseName, ext = os.path.splitext(inputPath)
    for width in sizesWidth:
        # compute new height to maintain aspect ratio
        aspectRatio = inputImage.width / inputImage.height
        height = int(round(width / aspectRatio))

        # resize image
        resizedImage = inputImage.resize((width, height), Image.LANCZOS)

        # save resized image
        outputPath = f"{baseName}-{width}-landscape{ext}"
        resizedImage.save(outputPath)
        print(f"Saved resized image: {outputPath}")

if(sizesWidth):
    generate_images_width(input, sizesWidth)

def generate_images_height(inputPath, sizesHeight):
    img = Image.open(inputPath)
    baseName, ext = os.path.splitext(inputPath)

    srcAspect = img.width / img.height

    for targetHeight in sizesHeight:
        targetWidth = int(round(targetHeight * srcAspect))

        scale = max(
            targetWidth / img.width,
            targetHeight / img.height
        )

        scaledW = int(round(img.width * scale))
        scaledH = int(round(img.height * scale))
        scaled = img.resize((scaledW, scaledH), Image.LANCZOS)

        left = (scaledW - targetWidth) // 2
        top = (scaledH - targetHeight) // 2
        right = left + targetWidth
        bottom = top + targetHeight

        cropped = scaled.crop((left, top, right, bottom))
        outputPath = f"{baseName}-{targetHeight}-portrait{ext}"
        cropped.save(outputPath)
        print(f"Saved cropped image: {outputPath}")

if(sizesHeight): 
    generate_images_height(input, sizesHeight)

def rindex(lst, value):
    return len(lst) - operator.indexOf(reversed(lst), value) - 1

def printOutSourceSetsToConsole():
    baseName, ext = os.path.splitext(input)
    
    last_slash = rindex(baseName, "/")
    if last_slash != -1:
        baseName = baseName[last_slash + 1:]

    sourceSetParts = []

    if(sizesWidth):
        for width in sorted(sizesWidth)[::-1]:
            outputPath = f"{pathRelativeToImgElement}{baseName}-{width}-landscape{ext}"
            sourceSetParts.append(f'<source srcSet="{outputPath}" media="(width > {width}px) and (orientation: landscape)" />')

    if(sizesHeight):
        for height in sorted(sizesHeight)[::-1]:
            outputPath = f"{pathRelativeToImgElement}{baseName}-{height}-portrait{ext}"
            sourceSetParts.append(f'<source srcSet="{outputPath}" media="(height > {height}px) and (orientation: portrait)" />')

    print("\n".join(sourceSetParts))

printOutSourceSetsToConsole()

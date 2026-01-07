import os
import sys
import argparse
from PIL import Image
import json
import math
import random

parser = argparse.ArgumentParser()
parser.add_argument("input", help="Input json file", type=str)
parser.add_argument("output", help="Output json file", type=str)

args = parser.parse_args()

inputPath = args.input
outputPath = args.output

def generate_circle_outline_image(cx, cy, width, height, pointCount, thickness=1, dotRadius=1):
    maxRadius = min(cx, cy) - dotRadius

    # empty image
    image = [[0 for _ in range(width)] for _ in range(height)]

    # compute total number of layers (pixel rings) in thickness
    layers = max(1, thickness)

    # for each point, assign a layer and angle
    for i in range(pointCount):
        # layer index cycles through 0..layers-1
        layer = i % layers
        # radius for this layer
        r = maxRadius - (thickness) + layer
        # evenly spaced angle around the circle
        angle = 2 * math.pi * i / pointCount
        x = int(round(cx + math.cos(angle) * r))
        y = int(round(cy + math.sin(angle) * r))

        # check bounds
        if 0 <= x < width and 0 <= y < height:
            image[y][x] = 1

    return image

def calculate_min_thickness(cx, cy, pointCount, dotRadius):
    """
    cx, cy       : circle center
    pointCount   : total number of dots
    dotRadius    : radius of each dot in pixels
    Returns:
        thickness  : minimum thickness (number of layers) needed to fit all dots
        outerRadius: max radius of the outermost circle (fits inside image)
    """
    maxRadius = min(cx, cy)  # max radius that fits inside image
    outerRadius = maxRadius

    # maximum dots on a single circumference at outer radius
    circumference = 2 * math.pi * outerRadius
    maxDotsPerLayer = int(circumference // (2 * dotRadius))
    if maxDotsPerLayer == 0:
        raise ValueError("Dot radius too large to fit any dot on the circle.")

    # calculate required layers to fit all dots
    layersNeeded = math.ceil(pointCount / maxDotsPerLayer)

    thickness = layersNeeded  # each layer = 1 pixel
    return thickness, outerRadius


with open(inputPath, "r") as openFile:
    inputData = json.load(openFile)

    points = inputData["points"]

    cx = 0
    cy = 0

    width = inputData["width"]
    height = inputData["height"]

    pointCount = int(round(len(points)))
    
    for point in points:
        cx += point[0]
        cy += point[1]

    cx = cx / pointCount
    cy = cy / pointCount

    cx = round(cx)
    cy = round(cy)

    thickness = calculate_min_thickness(cx, cy, pointCount, 1)
    print(thickness[0]/2)
    grid = generate_circle_outline_image(cx, cy, width, height, pointCount, int(thickness[0]/2))
    points = []

    for x in range(len(grid)):
        for y in range(len(grid[x])):
            if(grid[x][y] == 1):
                points.append([x, y])

    
    diff = pointCount - len(points)

    if(diff > 0):
        for i in range(diff):
           points.append([
                points[i][0],
                points[i][1],
                0
           ]) 


    with open(outputPath, "w") as outFile:
        json.dump({
            "points": points,
            "width": width,
            "height": height
        }, outFile)


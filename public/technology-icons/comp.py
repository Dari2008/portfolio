import os

root = "./"

result = ""
allfiles = []
for subdir, _, files in os.walk(root):
    for file in files:
        result += "\"" + file.replace(".svg", "") + "\" | "
        
print(result)
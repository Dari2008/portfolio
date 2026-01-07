import os
from PIL import Image
import threading
import re


distFile = "./dist/"

filesToReplace = ["png", "jpg", "jpeg"]
fileTo = "webp"

def convertImageToWebp(filePath):
    threading.Thread(target=_convertImageToWebp, args=(filePath,)).start()

def _convertImageToWebp(filePath):
    try:
        img = Image.open(filePath)
        newFilePath = os.path.splitext(filePath)[0] + "." + fileTo
        img.save(newFilePath, "webp")
        print(f"Converted {filePath} to {newFilePath}")
    except Exception as e:
        print(f"Failed to convert {filePath}: {e}")

fileNames: list[str] = []

def compileFiles():
    if not os.path.exists(distFile):
        os.makedirs(distFile)

    for root, dirs, files in os.walk(distFile):
        for file in files:
            if any(file.lower().endswith(ext) for ext in filesToReplace):
                if(root == distFile or root.count("icons") > 0):
                    print(f"Skipping excluded file: {file} in {root}")
                    continue
                filePath = os.path.join(root, file)
                convertImageToWebp(filePath)
                fileNames.append(os.path.split(filePath)[1])


def replaceFilesInCode():
    for root, dirs, files in os.walk(distFile):
        for file in files:
            if(root == "icons"):
                continue
            
            if any(file.lower().endswith(ext) for ext in [".html", ".js", ".css", ".json", ".xml"]):
                filePath = os.path.join(root, file)
                with open(filePath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                
                for name in fileNames:
                    newName = re.sub(r'\.(jpg|png|jpeg)', "." + fileTo, name)
                    content = content.replace(name, newName)

                with open(filePath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated references in {filePath}")


if __name__ == "__main__":
    compileFiles()
    replaceFilesInCode()
    print("Compilation complete.")

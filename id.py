import pyautogui
import time
import random

time.sleep(5)

def mov():
    pyautogui.moveTo(500 + (500 * random.random()), 300 + (500 * random.random()), duration=0.5 + (0.5 * random.random()))
    pyautogui.click()
    pyautogui.typewrite("Hello, world!" + str(random.random()), interval=(0.4 * random.random()))
    pyautogui.press("enter")
    pyautogui.press("enter")
    if(random.random() > 0.8):
        pyautogui.hotkey("ctrl", "s")

while True:
    mov()
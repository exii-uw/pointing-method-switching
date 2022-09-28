import json
import csv
import os

OUT_FILE = 'data.csv'

mypath = ""

fileNames = []

for folder, subs, files in os.walk(mypath):
  for filename in files:
    fileNames.append(os.path.abspath(os.path.join(folder, filename)))

def getDockingTime(rawLog):
    startMoveTime = 0
    hitTargetTime = 0

    for e in rawLog:
        if e[1] == 'token':
            startMoveTime = e[0]
        elif e[1] == 'hit_target':
            hitTargetTime = e[0]

    return hitTargetTime - startMoveTime

def getMissCounts(rawLog):
    wrongCount = 0
    posCount = 0

    for e in rawLog:
        if e[1] == 'miss_wrong_mode':
            wrongCount = wrongCount + 1
        elif e[1] == 'miss_down' or e[1] == 'miss_up' or e[1] == 'miss_center_not_on' or 'miss' in e[1]:
            posCount = posCount + 1
        elif 'miss' in e[1]:
            print(e)

    return wrongCount, posCount

with open(OUT_FILE, 'w', newline='') as out:
    writer = csv.writer(out, delimiter=',')
    writer.writerow(["participantNo", 'task', 'condition', 'forCond', 'mode', 'block', 'trialNo',
     'missCount', 'dockingTime', 'wrongModeCount', 'posMissCount', 'prevMode'])

for fileName in fileNames:
    #print(fileName)
    with open(fileName, 'r', encoding="utf8") as f:
        test =  json.loads(f.read())

        with open(OUT_FILE, 'a', newline='') as out:
            writer = csv.writer(out, delimiter=',')

            for i in range(0, len(test)):
                # print(test[i].keys())
                # print(test[i]['trialNo'])

                dockingTime = getDockingTime(test[i]['rawLog'])
                wrongModeCount, posMissCount = getMissCounts(test[i]['rawLog'])
                missCount = 0
                forCond = ''
                prevMode = ''

                temp = test[i]['condition'].split(",")

                if test[i]['currMode'] == temp[0]:
                    prevMode = temp[1]
                else:
                    prevMode = temp[0]
                

                if test[i]['taskType'] == 'baseline':
                    # print(fileName)
                    # print(test[i]['condition'])
                    # print(test[i]['trialNo'])
                    forCond = test[i]['for']
                    if forCond == "pen,trackpad":
                        forCond = "trackpad,pen"
                    elif forCond == "pen,mouse":
                        forCond = "mouse,pen"
                    elif forCond == "touch,pen":
                        forCond = "pen,touch"
                    elif forCond == "touch,trackpad":
                        forCond = "trackpad,touch"
                    elif forCond == "trackpad,mouse":
                        forCond = "mouse,trackpad"
                    elif forCond == "touch,mouse":
                        forCond = "mouse,touch"
                else:
                    forCond = ''

                if 'missCount' in test[i]:
                    missCount = test[i]['missCount']
                else:
                    missCount = 0

                if test[i]['pNo'].isdigit():
                    writer.writerow([test[i]['pNo'], test[i]['taskType'], 
                        test[i]['condition'], forCond, test[i]['currMode'], test[i]['block'],
                        test[i]['trialNo'] + 1, missCount, dockingTime, wrongModeCount, posMissCount, prevMode])


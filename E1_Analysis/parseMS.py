import json
import csv
import os

OUT_FILE = 'data_ms.csv'

mypath = ""

fileNames = []

for folder, subs, files in os.walk(mypath):
  for filename in files:
    fileNames.append(os.path.abspath(os.path.join(folder, filename)))

# switching time = time from hit_target[i] to 'token'[i+1]
# cycle A - 1-2, 3-4, 5-6, 7-8, etc.
# cycle B - 2-3, 4-5

def getSwitchingTime(trial1, trial2):
    hitCenterTime = 0
    tokenDownTime = 0
    for i in range(len(trial1['rawLog']) - 1, 0, -1):
        if trial1['rawLog'][i][1] == 'hit_center':
            #print('center time')
            hitCenterTime = trial1['rawLog'][i][0]
            break
        elif hitCenterTime == 0 and trial1['rawLog'][i][1] == 'hit_target':
            #print('no center time')
            hitCenterTime = trial1['rawLog'][i][0]
            break

    for i in range(0, len(trial2['rawLog'])):
        if trial2['rawLog'][i][1] == 'down':
            tokenDownTime = trial2['rawLog'][i][0] 
            break

    if hitCenterTime != 0 and tokenDownTime != 0:
        return int(tokenDownTime) - int(hitCenterTime)
    else:
        return -1

def getMissCount(trial1, trial2):
    hitCenterIndex = 0
    tokenDownIndex = 0
    missCount = 0
    wrongCount = 0
    posCount = 0

    for i in range(len(trial1['rawLog']) - 1, 0, -1):
        if trial1['rawLog'][i][1] == 'hit_center':
            hitCenterIndex = i - 10
            break
        elif hitCenterIndex == 0 and trial1['rawLog'][i][1] == 'hit_target':
            hitCenterIndex = i
            break

    for i in range(0, len(trial2['rawLog'])):
        if trial2['rawLog'][i][1] == 'down':
            tokenDownIndex = i + 1
            break

    if hitCenterIndex != 0 and tokenDownIndex != 0:
        #calculate misses
        for i in range(len(trial1['rawLog']) - 1, hitCenterIndex, -1):
            if "miss" in trial1['rawLog'][i][1]:
                if trial1['rawLog'][i][1] == 'miss_wrong_mode':
                    wrongCount = wrongCount + 1
                elif trial1['rawLog'][i][1] == 'miss_down' or trial1['rawLog'][i][1] == 'miss_up' or trial1['rawLog'][i][1] == 'miss_center_not_on' or 'miss' in trial1['rawLog'][i][1]:
                    posCount = posCount + 1
                elif 'miss' in trial1['rawLog'][i][1]:
                    print(trial1['rawLog'][i])
                print(trial1['rawLog'][i])
                missCount = missCount + 1

        for i in range(0, tokenDownIndex):
            if "miss" in trial2['rawLog'][i][1]:
                if trial2['rawLog'][i][1] == 'miss_wrong_mode':
                    wrongCount = wrongCount + 1
                elif trial2['rawLog'][i][1] == 'miss_down' or trial2['rawLog'][i][1] == 'miss_up' or trial2['rawLog'][i][1] == 'miss_center_not_on' or 'miss' in trial2['rawLog'][i][1]:
                    posCount = posCount + 1
                elif 'miss' in trial1['rawLog'][i][1]:
                    print(trial2['rawLog'][i])
                #print("next trial\n")
                print(trial2['rawLog'][i])
                missCount = missCount + 1

        if missCount > 0:
            print(missCount)
        return missCount, wrongCount, posCount

    else:
        return -1


with open(OUT_FILE, 'w', newline='') as out:
    writer = csv.writer(out, delimiter=',')
    writer.writerow(["participantNo", 'task', 'condition', 'forCond', 'mode', 'block', 'cycleNo', 'cycleType', 'trialNos',
     'switchingTime', "switchMissCount", 'wrongModeCount', 'posMissCount'])

for fileName in fileNames:
    #print(fileName)
    #print('baseline' in fileName)
    with open(fileName, 'r', encoding="utf8") as f:
        test =  json.loads(f.read())
        cycleNo = 1

        with open(OUT_FILE, 'a', newline='') as out:
            writer = csv.writer(out, delimiter=',')

            if (test[0]['taskType'] != 'baseline'):
                forCond = ''
                switchTime = 0
                switchTime2 = 0
                for i in range(0, len(test) - 1, 2):
                    #print("calling functions")
                    switchTime = getSwitchingTime(test[i], test[i + 1])
                    missCount, wrongCount, posCount = getMissCount(test[i], test[i + 1])

                    if test[i]['pNo'].isdigit():
                        writer.writerow([test[i]['pNo'], test[i]['taskType'], 
                            test[i]['condition'], forCond, test[i]['currMode'], test[i]['block'],
                            cycleNo, 'A',
                            str(test[i]['trialNo'] + 1) + "," + str(test[i]['trialNo'] + 2), 
                            switchTime, missCount, wrongCount, posCount])
                    cycleNo = cycleNo + 1

                    if (i + 2) < len(test):
                        #print(test[i + 1]['trialNo'])
                        #print(test[i + 2]['trialNo'])
                        #print("calling functions again")
                        switchTime2 = getSwitchingTime(test[i + 1], test[i + 2])
                        missCount2, wrongCount2, posCount2 = getMissCount(test[i + 1], test[i + 2])
                        #print(switchTime2)
                        if test[i]['pNo'].isdigit():
                            writer.writerow([test[i + 1]['pNo'], test[i + 1]['taskType'], 
                            test[i + 1]['condition'], forCond, test[i + 1]['currMode'], test[i + 1]['block'],
                            cycleNo, 'B',
                            str(test[i + 1]['trialNo'] + 1) + "," + str(test[i + 1]['trialNo'] + 2), 
                            switchTime2, missCount2, wrongCount2, posCount2])
                        cycleNo = cycleNo + 1
            elif test[0]['taskType'] == 'baseline':
                forCond = ''
                switchTime = 0
                if 'for' in test[0].keys():
                    forCond = test[0]['for']

                for i in range(0, len(test) - 1, 2):
                    # print(test[i]['trialNo'])
                    # print(test[i + 1]['trialNo'])
                    # print()
                    if test[i]['pNo'].isdigit():
                        switchTime = getSwitchingTime(test[i], test[i + 1])
                        missCount, wrongCount, posCount = getMissCount(test[i], test[i + 1])

                        writer.writerow([test[i]['pNo'], test[i]['taskType'], 
                            test[i]['condition'], forCond, test[i]['currMode'], test[i]['block'],
                            cycleNo, 'A',
                            str(test[i]['trialNo'] + 1) + "," + str(test[i]['trialNo'] + 2), 
                            switchTime, missCount, wrongCount, posCount])
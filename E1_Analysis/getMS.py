import csv
import os

bTimes = {}
names = []
output = []

with open('subTimes.csv', 'r') as f:
    reader = csv.DictReader(f, delimiter=',')
    for row in reader:
        bTimes[row['participantNo'] + "-" + row['forCond'] + "-" + row['mode']] = float(row['mST'])

with open('data_ms.csv', 'r') as f:
    reader = csv.DictReader(f, delimiter=',')
    names = reader.fieldnames
    names.append("msTimeA")
    names.append("msTimeB")
    names.append("msTimeC")

    for row in reader:
        if row['task'] == 'task':
            print(row)
            keyName = row['participantNo'] + "-" + row['condition'] + "-" 
            conds = row['condition'].split(",")
            msTime = float(row['switchingTime'])
            subTime = 0

            if row['participantNo'] != 'test2':
                if row['cycleType'] == 'A':
                    subTime = bTimes[keyName + conds[0]] + bTimes[keyName + conds[1]]
                else:
                    subTime = bTimes[keyName + conds[0]] + bTimes[keyName + conds[1]]
            else:
                if row['cycleType'] == 'A':
                    subTime = bTimes[row['participantNo'] + "--" + conds[0]] + bTimes[row['participantNo'] + "--" + conds[1]]
                else:
                    subTime = bTimes[row['participantNo'] + "--" + conds[0]] + bTimes[row['participantNo'] + "--" + conds[1]]

            msTime = float(msTime) - float(subTime)

            row['msTimeA'] = msTime

            msTime = float(row['switchingTime'])
            subTime = 0

            if row['participantNo'] != 'test2':
                if row['cycleType'] == 'A':
                    subTime = bTimes[keyName + conds[1]]
                else:
                    subTime = bTimes[keyName + conds[0]]
            else:
                if row['cycleType'] == 'A':
                    subTime = bTimes[row['participantNo'] + "--" + conds[1]]
                else:
                    subTime = bTimes[row['participantNo'] + "--" + conds[0]]

            msTime = float(msTime) - float(subTime)

            row['msTimeB'] = msTime

            msTime = float(row['switchingTime'])
            subTime = 0

            if row['participantNo'] != 'test2':
                if row['cycleType'] == 'A':
                    subTime = (bTimes[keyName + conds[0]] + bTimes[keyName + conds[1]]) / 2
                else:
                    subTime = (bTimes[keyName + conds[0]] + bTimes[keyName + conds[1]]) / 2
            else:
                if row['cycleType'] == 'A':
                    subTime = (bTimes[row['participantNo'] + "--" + conds[0]] + bTimes[row['participantNo'] + "--" + conds[1]]) /2
                else:
                    subTime = (bTimes[row['participantNo'] + "--" + conds[0]] + bTimes[row['participantNo'] + "--" + conds[1]]) / 2

            msTime = float(msTime) - float(subTime)

            row['msTimeC'] = msTime
            print(row)
            output.append(row)
        else:
            row['msTimeA'] = 0
            row['msTimeB'] = 0
            row['msTimeC'] = 0
            output.append(row)
 
with open('data_ms.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, names)

    writer.writeheader()
    writer.writerows(output)

            





import json
from random import shuffle, randint

conditions = {0: "mouse,pen", 1: "pen,touch", 
2: "trackpad,pen", 3: "mouse,touch",
4: "mouse,trackpad", 5: "trackpad,touch"}

# conditions = {0: "mouse,trackpad", 1:"mouse,trackpad", 
# 2: "mouse,trackpad", 3: "mouse,trackpad",
# 4: "mouse,trackpad", 5: "touch,trackpad"}

def create_latin_square(n: int, start_el: int=1):
    row = [i for i in range(0, n)]
    row = row[start_el-1:] + row[:start_el-1]
    return [row[i:] + row[:i] for i in range(n)]

def print_matrix(n):
    for row in n:
        print(row)

square = create_latin_square(6)

square = square + square

cond_matrix = []

for i in range(len(square)):
    l = []
    for j in range(len(square[i])):
        l.append(conditions[square[i][j]])
    cond_matrix.append(l)

print_matrix(cond_matrix)

timelines = {}
NUM_OF_BLOCKS = 4
NUM_OF_CIRCS = 7

for p in range(len(cond_matrix)):
    tl = []
    tl.append({"stage": 'info'})
    tl.append({"stage": 'consent'})
    tl.append({"stage" :"survey", "conds": 'end'})
    for i in range(len(cond_matrix[p])):
        #tl.append("instruction," + cond_matrix[p][i])
        conds = cond_matrix[p][i].split(',')
        baselineOrd = list(conds)
        shuffle(baselineOrd)

        tl.append({"stage" : "instruction", "conds": [baselineOrd[0], baselineOrd[0]]})
        tl.append({"stage" : "baseline", 
            "conds": [baselineOrd[0], baselineOrd[0]],
            "for": [baselineOrd[0], baselineOrd[1]],
            "block": "1",
            "startPos": randint(0, NUM_OF_CIRCS)})
        tl.append({"stage": "instruction", "conds": [baselineOrd[1],  baselineOrd[1]]})
        tl.append({"stage" : "baseline", 
            "conds": [baselineOrd[1], baselineOrd[1]],
            "for": [baselineOrd[0], baselineOrd[1]],
            "block": "1",
            "startPos": randint(0, NUM_OF_CIRCS)})

        tl.append({"stage": "instruction", "conds": [conds[0], conds[1]]})

        for j in range(NUM_OF_BLOCKS):
            tl.append({"stage": "task", 
                "conds": [conds[0], conds[1]], 
                "block": j+1,
                "startPos": randint(0, NUM_OF_CIRCS)})

        tl.append({"stage": "instruction", "conds": [baselineOrd[1],  baselineOrd[1]]})
        tl.append({"stage" : "baseline", 
            "conds": [baselineOrd[1], baselineOrd[1]],
            "for": [baselineOrd[0], baselineOrd[1]],
            "block": "2",
            "startPos": randint(0, NUM_OF_CIRCS)})
        tl.append({"stage" : "instruction", "conds": [baselineOrd[0], baselineOrd[0]]})
        tl.append({"stage" : "baseline", 
            "conds": [baselineOrd[0], baselineOrd[0]],
            "for": [baselineOrd[0], baselineOrd[1]],
            "block": "2",
            "startPos": randint(0, NUM_OF_CIRCS)})

        tl.append({"stage" :"survey", "conds": conds[0] + conds[1]})

    tl.append({"stage" :"done"})
    timelines[p+1] = tl

timelines['desktop'] = [
    {"stage" : "info"},
    {"stage" : "consent"},
    {"stage" : "instruction",
    "conds": ["mouse", "trackpad"]},
    {"stage": "task",
    "conds": ["trackpad", 'mouse'],
    "block" : "1",
    "startPos" : 6},
    {"stage": "task",
    "conds": ["mouse", "trackpad"],
    "block" : "2",
    "startPos" : 5},
    {"stage": "survey", "conds": "end"},
    {"stage" : "done"}
]

timelines['allconds'] = [
    {"stage" : "info"},
    {"stage" : "consent"},
    {"stage" : "instruction",
    "conds": ["mouse", "trackpad"]},
    {"stage": "task",
    "conds": ["mouse", "trackpad"],
    "block" : "1",
    "startPos" : 0},
    {"stage": "survey", "conds": "trackpadmouse"},
    {"stage" : "instruction",
    "conds": ["pen", "touch"]},
    {"stage": "task",
    "conds": ["pen", "touch"],
    "block" : "1",
    "startPos" : 0},
    {"stage": "survey", "conds": "pentouch"},
    {"stage" : "done"}
]

timelines['touchpen'] = [
    {"stage" : "info"},
    {"stage" : "consent"},
    {"stage" : "instruction",
    "conds": ["touch", "pen"]},
    {"stage": "task",
    "conds": ["touch", "pen"],
    "block" : "1",
    "startPos" : 3},
    {"stage" : "instruction",
    "conds": ["pen", "touch"]},
    {"stage": "task",
    "conds": ["pen", "touch"],
    "block" : "2",
    "startPos" : 6},
    {"stage" : "instruction",
    "conds": ["pen", "touch"]},
    {"stage": "task",
    "conds": ["pen", "touch"],
    "block" : "3",
    "startPos" : 2},
    {"stage" : "done"}
]

timelines['touchmouse'] = [
    {"stage" : "info"},
    {"stage" : "consent"},
    {"stage" : "instruction",
    "conds": ["touch", "mouse"]},
    {"stage": "task",
    "conds": ["touch", "trackpad"],
    "block" : "1",
    "startPos" : 3},
    {"stage" : "survey"},
    {"stage" : "done"}
]

timelines['penmouse'] = [
    {"stage" : "info"},
    {"stage" : "consent"},
    {"stage" : "instruction",
    "conds": ["pen", "mouse"]},
    {"stage": "task",
    "conds": ["pen", "mouse"],
    "block" : "1",
    "startPos" : 3},
    {"stage": "survey", "conds": "end"},
    {"stage" : "done"}
]

timelines['speed'] = [
    {"stage" : "info"},
    {"stage" : "consent"},
    {"stage" : "instruction",
    "conds": ["touch", "touch"]},
    {"stage": "baseline",
    "conds": ["touch", "touch"],
    "for":  ["touch", "mouse"],
    "block" : "1",
    "startPos" : 0},
    {"stage": "survey", "conds": "end"},
    {"stage" : "done"}
]

timelines['surveyTest'] = [
    {"stage" : "info"},
    {"stage" : "consent"},
    {"stage" : "instruction",
    "conds": ["mouse", "mouse"]},
    {"stage": "baseline",
    "conds": ["mouse", "mouse"],
    "for": ["mouse", "mouse"],
    "block" : "1",
    "startPos" : 0},
    {"stage": "survey", "conds": "end"},
    {"stage" : "done"}
]

timelines['speed2'] = [
    {"stage" : "info"},
    {"stage" : "consent"},
    {"stage" : "instruction",
    "conds": ["mouse", "mouse"]},
    {"stage": "baseline",
    "conds": ["mouse", "mouse"],
    "for": ["mouse", "mouse"],
    "block" : "1",
    "startPos" : 6},
    {"stage": "survey", "conds": "end"},
    {"stage" : "done"}
]

timelines['training'] = [
    {"stage" : "info"},
    {"stage" : "instruction",
    "conds": ["pen", "touch"]},
    {"stage": "task",
    "conds": ["pen", "touch"],
    "block" : "1",
    "startPos" : 2},
    {"stage" : "done"}
]

timelines['baseline'] = [
    {"stage" : "info"},
    {"stage" : "instruction",
    "conds": ["mouse", "mouse"]},
    {"stage": "baseline",
    "conds": ["mouse", "mouse"],
    "for": ["mouse", "mouse"],
    "block" : "1",
    "startPos" : 6},
    {"stage" : "instruction",
    "conds": ["pen", "pen"]},
    {"stage": "baseline",
    "conds": ["pen", "pen"],
    "for": ["mouse", "mouse"],
    "block" : "1",
    "startPos" : 5},
    {"stage" : "instruction",
    "conds": ["touch", "touch"]},
    {"stage": "baseline",
    "conds": ["touch", "touch"],
    "for": ["mouse", "mouse"],
    "block" : "1",
    "startPos" : 4},
    {"stage" : "instruction",
    "conds": ["trackpad", "trackpad"]},
    {"stage": "baseline",
    "conds": ["trackpad", "trackpad"],
    "for": ["mouse", "mouse"],
    "block" : "1",
    "startPos" : 3},
    {"stage" : "done"}
]

timelines['conds'] = [
    {"stage" : "info"},
    {"stage" : "instruction",
    "conds": ["touch", "pen"]},
    {"stage": "task",
    "conds": ["touch", "pen"],
    "block" : "1",
    "startPos" : 3}, 
    {"stage" : "instruction",
    "conds": ["touch", "mouse"]},
    {"stage": "task",
    "conds": ["touch", "mouse"],
    "block" : "1",
    "startPos" : 3}, 
    {"stage" : "instruction",
    "conds": ["mouse", "pen"]},
    {"stage": "task",
    "conds": ["mouse", "pen"],
    "block" : "1",
    "startPos" : 3},   
    {"stage" : "instruction",
    "conds": ["mouse", "trackpad"]},
    {"stage": "task",
    "conds": ["mouse", "trackpad"],
    "block" : "1",
    "startPos" : 3}, 
    {"stage" : "instruction",
    "conds": ["trackpad", "pen"]},
    {"stage": "task",
    "conds": ["trackpad", "pen"],
    "block" : "1",
    "startPos" : 3},
    {"stage" : "instruction",
    "conds": ["trackpad", "touch"]},
    {"stage": "task",
    "conds": ["trackpad", "touch"],
    "block" : "1",
    "startPos" : 3},   
    {"stage" : "done"}

]


timelines['test1'] = timelines[1]
timelines['test2'] = timelines[2]
timelines['test3'] = timelines[3]
timelines['test4'] = timelines[4]
#['info','instruction,mouse,trackpad', 'task,trackpad,mouse', 'instruction,mouse,mouse', 'baseline,mouse,mouse', 'done']
#timelines['allconds'] = ['info', 'instruction,mouse,trackpad', 'task,mouse,trackpad', 'instruction,pen,touch', 'task,pen,touch', 'done']

with open('public/timelines.json', 'w') as f:
    json.dump(timelines, f, indent=2)
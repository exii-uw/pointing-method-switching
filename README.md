Supplementary Files:
Software needed: Python 3, RStudio, ReactJS, Node.js
captions.sbv - the captions for the video figure
In E1_Analysis:
- figures/ has figures produced by the R scripts
- data.csv is output by parseRaw.py
- data_ms.csv is output by parseMS.py, and is input for getMS.py
- E1-ModeSwitchPref.Rmd and .html analyzes the subjective ratings
- E1-ModeSwitchStats.Rmd and .html are the main analysis
- getMS.py is a python script that uses subTimes.csv to perform the subtraction method to get method switching times
- parseMS.py and parseRaw.py are python scripts that transform the raw logs into csv files, and compute measures
- subTimes.csv is output by E1-ModeSwitchStats.Rmd, and is used by getMS.py
In E2_Analysis:
- figures/ has figures produced by the R scripts
- pref/ has subjective ratings data
- raw_data/ has the raw data collected from the experiment
- data1.csv is output by parseRaw.py
- data_ms.csv is output by parseMS.py, and is input for getMS.py
- E1-ModeSwitchPref.Rmd and .html analyzes the subjective ratings
- E1-ModeSwitchStats.Rmd and .html are the main analysis
- getMS.py is a python script that uses subTimes.csv to perform the subtraction method to get method switching times
- parseMS.py and parseRaw.py are python scripts that transform the raw logs into csv files, and compute measures
- subTimes.csv is output by E1-ModeSwitchStats.Rmd, and is used by getMS.py
In E1vsE2:
- The csv files are the data files from E1_Analysis/ and E2_Analysis/
- E1vsE2.Rmd and .html compare Experiment 1 and Experiment 2

In ms_exp/ and ms_exp_fold/:
- Files to run our experiments, which use ReactJS and Node.js
- To run, import node_modules/, and use "yarn start" 

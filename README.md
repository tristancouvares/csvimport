# csvimpot

issue: https://help.lever.co/hc/en-us/articles/204498425-How-do-I-add-multiple-import-many-candidates-

Solution:
quick hack to reformat a csv file so that level can do a mass import for you

how to:

Open up a terminal in the directory, type "npm install"
Put the csv in the same directory. 

Run the command below to transform:
node index.js ./source.csv ./destination.csv

*you may need to npm install clean*

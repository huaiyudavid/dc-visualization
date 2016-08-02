# dc-visualization
A visualization application for experiments in decentralized coordination

## Installation
First, install [Meteor.js](https://www.meteor.com/install).

Then clone this repo to your local machine.

## Adding experiments to the app (developer mode)
1. Place the log file and the network configuration file in the same folder as parselog.py and other python files.
2. Go into parselog.py and change the input file names in main() to match your files. Also change the date to match the experiment date in the format YYYYMMDD.
3. Run parselog.py (`python parselog.py`)
4. parselog.py will output a JSON file in the form of `experimentYYYYMMDD.json`
5. Go into `/dc-visualization/imports/router.js` and `/dc-visualization/imports/ui/loadedData.js` and change all instances of `20160707` to one of the dates of your experiments.
6. While in the main directory (/dc-visualization), run `meteor`. This will start up the MongoDB database.
7. Open a separate window, navigate to the same directory, and use this command: `mongoimport -h localhost:3001 --db meteor --collection sessions --type json --file experiment.json &> output.txt`
  * If mongoimport is not installed, follow the system instructions to install it.
  * If you are not using the default meteor port (3000), replace the port number in `localhost:3001` with your port number + 1.
  * You should replace `experiment.json` with the path to your own experiment JSON file.
8. Run `meteor mongo`. This will take you into the database console.
9. Run `db.dates.insert({date: YYYYMMDD})`
  * Replace YYYYMMDD with the correct date.
10. Open a browser, navigate to `*your_ip:3000*` and the app should be running.
  * Again, replace the port number if you are using a different port.

## Adding experiments to the app (deployment mode)
TODO

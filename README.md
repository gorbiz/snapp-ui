<img align="left" src="time-lapse.svg" width="122" height="122">

# Snapp user interface
A web interface to view photo series as timelapses.

## Usage
Click (or tap) the right / left half of the image to go to the next / previous image.

# Installation & configuration

## Start it
```sh
git clone git@github.com:gorbiz/snapp-ui.git # get the code
cd snaps-ui
npm install                                  # install dependencies
IMG_PATH=../snaps node index.js              # start the appliaction
chromium http://localhost:3000               # go to the web interface
```

## If you don't have Node.js & npm
Example installation:
```sh
# install nvm (node version manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
# install node & npm
nvm install
```

## Run the application forever
Example using pm2:
```sh
npm install --global pm2
IMG_PATH=../snaps PORT=3000 pm2 start
pm2 save
pm2 startup
# follow pm2's instructions
```

## Adding poor persons security
```sh
IMG_PATH=../snaps BASE_URL=/poor-persons-secret/ PORT=3000 pm2 start
chromium http://localhost:3000/poor-persons-secret/ # URL no one can guess 😂
```

# Developing

## live reload
1. `IMG_PATH=../snaps LIVERELOAD=1 node .`
2. Code away! ...and see changes in realtime on any device!

## Deploy script example

`deploy.sh`
```sh
#!/bin/bash

# ./deploy   <-- deploy files
# ./deploy x <-- also `npm install`

scp -r *.js *.json *.svg views/ server:snapp-ui
[ $# -eq 1 ] && ssh server '. ~/.profile; cd snapp-ui && npm i'
ssh server '. ~/.profile; pm2 restart all'
```

### PS. Assuming...

`~/.ssh/config` contains something like:
```
Host server
  Hostname my-server.com
  User my-username
  Port 22
```
And that you exchanged keys with `server`, ex. by running `ssh-copy-id server`.

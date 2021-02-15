# Snaps user interface
A web interface to view photo series as timelapses.

# Start it
```sh
git clone git@github.com:gorbiz/snapp-ui.git # get the code
cd snaps-ui
npm install                                  # install dependencies
IMG_PATH=../snaps node index.js              # start the appliaction
chromium http://localhost:3000               # go to the web interface
```

# If you don't have Node.js & npm
Example installation:
```sh
# install nvm (node version manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
# install node & npm
nvm install
```

# Run the application forever
Example using pm2:
```sh
npm install --global pm2
IMG_PATH=/some-path/with-pictures BASE_URL=poor-persons-secret PORT=3000 pm2 start
pm2 startup
# follow pm2's instructions
```
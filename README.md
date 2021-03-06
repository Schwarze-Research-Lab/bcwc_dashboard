The [site](https://bcwc.surgery.wisc.edu/) is built using a modern tailwind vite stack with vanilla js. The site is only acceissable to those on the UW network. The primary library used is chart.js for all visuals. Feel free to lift code from here for your own dashboard. 

## Local Dev Deploy
```
npm install
npm run dev
```
## Production Deploy

See `package.json` for info on what npm commands do

```
npm run build
npm run deploy
```
## Connecting to Production

* Get a static IP issued by wisc from [here](https://access.services.wisc.edu/IPaddress)
* Reach out to Paul Vreugdenhil for credenitals for a first time connection
  * Currently there is one end user account on the server named "bcwc", credentials are shared.
* Connect to the UW VPN via the static account you are assigned. You will need to connect to the VPN to deploy even when on the UW net.
* `ssh bcwc@bcwc.surgery.wisc.edu` and install an ssh key like normal. 
* A symlink in the home directy points to the root of the webserver

## Issues Encountered

If another developer tries to spin up a server with DOS IT here are a few issues I ran into:

* PHP Curl was missing, an admin will need to `sudo apt install php8.0-curl`
* The apache user that serves web content doesn't invoke profile.d, if you add a script to `/etc/profile.d/foo.sh` and expect it to load any enviroment variables you will be disappointed.
* PHP, by default, clears foreign enviroment variables.
* Due to the above two issues, we simply store our API token in the user home directory and read the file with our PHP proxy

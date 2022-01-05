The [site](https://bcwc.surgery.wisc.edu/) is built using a modern tailwind vite stack with vanilla js

## Local Dev Deploy

```
npm install
npm run dev
```
## Production Deploy

```
npm run build
scp -r dist/* bcwc@bcwc.surgery.wisc.edu:~/dashboard/
```
## Connecting to Production

* Get a static IP issued by wisc from [here](https://access.services.wisc.edu/IPaddress)
* Reach out to Paul Vreugdenhil for credenitals for a first time connection
  * Currently there is one end user account on the server named "bcwc", credentials are shared.
* `ssh bcwc@bcwc.surgery.wisc.edu` and install an ssh key like normal. 
* A symlink in the home directy points to the root of the webserver

## Issues Encountered

If another developer tries to spin up a server with DOS IT here are a few issues I ran into:

* PHP Curl was missing, an admin will need to `sudo apt install php8.0-curl`
* The apache user that serves web content doesn't invoke profile.d, if you add a script to `/etc/profile.d/foo.sh` and expect it to load any enviroment variables you will be disappointed.
* PHP, by default, clears foreign enviroment variables.
* Due to the above two issues, we simply store our API token in the user home directory and read the file with our PHP proxy
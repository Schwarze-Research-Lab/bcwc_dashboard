The [site](https://bcwc.surgery.wisc.edu/) is built using a modern tailwind vite stack with vanilla js

## Todo List

* Line Chart
    * We crash to zero a lot even with 1 week buckets. Issue?
* Enrollment by nephrologist  
    * How do we want to present nephrologist info?
    * first_neph_seen
* Total screened by nephrologist 
    * I’d like to have total number nephrologists enrolled at site on here but it’s a little more complicated in that their drop out/other status info is saved in a different redcap project leave
* Low Priority
    * Date of last decline  
        * Not sure if we can get at this info easily, might need to make redcap project changes


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
* `ssh bcwc@bcwc.surgery.wisc.edu` and install an ssh key like normal. 
* A symlink in the home directy points to the root of the webserver

## Issues Encountered

If another developer tries to spin up a server with DOS IT here are a few issues I ran into:

* PHP Curl was missing, an admin will need to `sudo apt install php8.0-curl`
* The apache user that serves web content doesn't invoke profile.d, if you add a script to `/etc/profile.d/foo.sh` and expect it to load any enviroment variables you will be disappointed.
* PHP, by default, clears foreign enviroment variables.
* Due to the above two issues, we simply store our API token in the user home directory and read the file with our PHP proxy

[Site](https://bcwc.surgery.wisc.edu/)

## Local Dev Deploy

```
npm install
npm run dev
```
## Connecting to Production

* Get a static IP issued by wisc from [here](https://access.services.wisc.edu/IPaddress)
* Reach out to Paul Vreugdenhil for credenitals for a first time connection
  * Currently there is one end user account on the server named "bcwc", credentials are shared.
* `ssh bcwc@bcwc.surgery.wisc.edu` and install an ssh key like normal. 
* A symlink in the home directy points to the root of the webserver

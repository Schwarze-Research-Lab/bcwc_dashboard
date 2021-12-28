**This git repo contains one plain text api key to fetch data from redcap. The repo should never be made public without purging the git history.**

[Site](https://bcwc.surgery.wisc.edu/)

## Technical notes

* navbar lifted from [here](https://codepen.io/j_holtslander/pen/XmpMEp) 
* Bootstrap 3 was used to support the above
* Font awesome 4.7 is used for compatability with the above also

## Connecting (for dev)

* Get a static IP issued by wisc from here
* Reach out to Paul Vreugdenhil for credenitals for a first time connection
  * Currently there is one end user account on the server named "bcwc".
* `ssh bcwc@bcwc.surgery.wisc.edu` and install an ssh key like normal. 
* A symlink in the home directy points to the root of the webserver
* Any `git commit` will trigger the post-commit git hook and scp all directory files to the server. Git clone from the server is not an option as SSH is disabled
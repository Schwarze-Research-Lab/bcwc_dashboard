[Site](https://bcwc.surgery.wisc.edu/)

Switch to navbar [here](https://codepen.io/j_holtslander/pen/XmpMEp) 

## Connecting (for dev)

* Get a static IP issued by wisc from here
* Reach out to Paul Vreugdenhil for credenitals for a first time connection
  * Currently there is one end user account on the server named "bcwc".
* `ssh bcwc@bcwc.surgery.wisc.edu` and install an ssh key like normal. 
* A symlink in the home directy points to the root of the webserver
* Any `git commit` will trigger the post-commit git hook and scp all directory files to the server. Git clone from the server is not an option as SSH is disabled
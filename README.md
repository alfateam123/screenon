# ScreenOn

ScreenOn is an application to measure how much time an user spends on their phone.
It is composed of an Automate flow, and a web application with a Polymer frontend
and a Python/Flask backend.

I described it in a [dedicated blog post](https://wintermade.it/blog/posts/screenon-measuring-phone-usage-with-automate-and-python.html)

DISCLAIMER: in its current state, this application is not meant to be hosted
on the internet. It's recommended to host this application on a host in a local
network (eg on a Raspberry Pi).

## Build the frontend part (from Polymer-CLI)

### Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your application locally.

### Viewing Your Application

```
$ polymer serve
```

### Building Your Application

```
$ polymer build
```

This will create builds of your application in the `build/` directory, optimized to be served in production.

## Configure the webserver

See the provided basic nginx.conf file.
If you already use pi-hole, you can [add a special
domain name to the local DNS server](https://www.reddit.com/r/pihole/comments/4bsb84/use_pihole_to_resolve_local_dns/).

## Backend

### Build the backend

```
$ virtualenv .venv
$ source .venv/bin/activate
$ pip install -e .
```

### Run the backend

```
$ bash run_app.sh
```

## Automate flow

You need to install [Automate](https://llamalab.com/automate/) on your phone.

* Import the "Screen tracker.flo" file from the application
* Execute the "Config" flow
* Edit the "Backup" flow to change the URL of the backup server
* Launch the "Start" flow to start screen changes recording


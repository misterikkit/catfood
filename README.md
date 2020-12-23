# Device & Backend

Device code runs on a raspberry pi in the cat food dispenser. The only behavior
specific to the rpi/device is in hardware.js, which drives the auger motor. A
fake device can be run with `npm run fake`.

Backend code can run anywhere, but has some requirements.

- (obviously) Needs SSL (no Heroku free dynos)
- Needs google cloud credentials to read/write datastore entities
- Needs to serve on an origin domain that matches the OAuth credentials in use
- Needs to allow websockets (no AppEngine standard)

# Datastore schema

TODO: describe it

# Production

Both device and backend use pm2 to manage the app. They also use nvm to install node/npm.

```
# backend
pm2 start index.js --name catfood-backend --log $HOME/catfood.log

# device
pm2 start run.sh --name catfood-device --log $HOME/catfood.log
```

A free GCE f1-micro with static IPv4 address. This allows full flexibility on allowing websockets and managing SSL.

- Use nginx reverse proxy to terminate SSL. (Supports websockets!!)
  ```
  location / {
    proxy_pass      http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
  }
  ```
- Use certbot to get and auto-renew LetsEncrypt certs (`--nginx` plugin)

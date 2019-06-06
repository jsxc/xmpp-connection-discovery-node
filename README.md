[![npm version](https://badge.fury.io/js/xmpp-connection-discovery.svg)](https://www.npmjs.com/package/xmpp-connection-discovery)

# XMPP connection discovery
:mag: Use RFC6120 and XEP-0156 to discover XMPP connection services.

## Features
- [Query SRV records](https://tools.ietf.org/html/rfc6120#section-3.2.1)
- [Query TXT records](https://xmpp.org/extensions/xep-0156.html#dns)
- [Query Host Metadata](https://xmpp.org/extensions/xep-0156.html#http)

## How to use
Install this module as usual with `yarn add xmpp-connection-discovery` and import the script:
```
const discoverXMPPServices = require('xmpp-connection-discovery');
```

Discover TCP, websocket and BOSH services like this:
```
discoverXMPPServices('your.domain').then((services) => {
   console.log(services);

   /* { tcp: [ { server: 'xmpp.your.domain', port: 5222 } ],
  xbosh: [ { server: 'https://xmpp.your.domain:5280/http-bind' } ] } */
})
```

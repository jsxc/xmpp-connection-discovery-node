const dns = require('dns');
const axios = require('axios').default;
const parseXmlString = require('xml2js').parseString;

const XRD_NAMESPACE = 'http://docs.oasis-open.org/ns/xri/xrd-1.0';

/**
 * Query SRV records according to {@link https://tools.ietf.org/html/rfc6120#section-3.2.1}.
 */
function querySRV(domain) {
   return new Promise((resolve) => {
      dns.resolveSrv(`_xmpp-client._tcp.${domain}`, (err, records) => {
         if (err || !records) return resolve([]);

         let services = records.map((record) => {
            return {
               server: record.name,
               port: record.port,
               protocol: 'tcp'
            };
         });

         return resolve(services);
      });
   });
}

/**
 * Query TXT records according to {@link https://xmpp.org/extensions/xep-0156.html#dns}.
 */
function queryTXT(domain) {
   return new Promise((resolve) => {
      dns.resolveTxt(`_xmppconnect.${domain}`, (err, records) => {
         if (err || !records) return resolve([]);

         let services = [];

         for (let record of records) {
            for (let entry of record) {
               let matches = entry.match(/^_xmpp-client-(xbosh|websocket)=((wss|https):\/\/.+)/);

               if (matches !== null && matches.length > 2) {
                  services.push({
                     server: matches[2],
                     protocol: matches[1]
                  });
               }
            }
         }

         return resolve(services);
      });
   });
}

/**
 * Query Web Host Metadata according to {@link https://xmpp.org/extensions/xep-0156.html#http}.
 */
async function queryHostMeta(domain) {
   let response;

   try {
      response = await axios(`https://${domain}/.well-known/host-meta`);
   } catch(err) {
      return [];
   }

   if (!response || response.status !== 200 || !response.data) {
      return [];
   }

   return new Promise(resolve => {
      parseXmlString(response.data, (err, result) => {
         if (!result) return resolve([]);

         let XRD = result.XRD;

         if (!XRD || !XRD.$ || XRD.$.xmlns !== XRD_NAMESPACE) return resolve([]);

         if (!XRD.Link) return resolve([]);

         let services = [];

         for (let link of XRD.Link) {
            if (!link.$ || !link.$.href || !link.$.rel) continue;

            let href = link.$.href;
            let rel = link.$.rel;
            let matches = rel.match(/^urn:xmpp:alt-connections:(xbosh|websocket)$/);

            if (!matches) continue;

            services.push({
               server: href,
               protocol: matches[1]
            });
         }

         return resolve(services);
      });
   });
}

function discoverServices(domain) {
   return Promise.all([
      querySRV(domain),
      queryTXT(domain),
      queryHostMeta(domain)
   ]).then((results) => {
      let services = results.reduce((acc, curr) => (acc || []).concat(curr));
      let indexed = {};

      for (let service of services) {
         let protocol = service.protocol;
         delete service.protocol;

         if (!indexed[protocol]) indexed[protocol] = [];

         indexed[protocol].push(service);
      }

      return indexed;
   });
}

module.exports = discoverServices;

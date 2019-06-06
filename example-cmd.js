const connectionDiscovery = require('./index.js');

let domain = process.argv[2];

if (!domain) {
  console.warn('No domain provided.');

  return;
}

connectionDiscovery(domain).then((services) => {
  for(let type in services) {
    console.log(`* ${type}`);

    for (let service of services[type]) {
      console.log(`   - ${service.server}${service.port ? ':' + service.port : ''}`);
    }
  }

  if (!services) {
    console.log(`I found no services for ${domain}.`)
  }
});

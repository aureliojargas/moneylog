// See configuration help at:
// http://aurelio.net/moneylog/config/

// Set app lang
// Using portuguese because our userbase is mainly from Brazil
lang = 'pt';

// Disable drivers that do not make sense on this online version
ml.storage.availableDrivers = [
  // 'html',
  // 'filesystem',
  'browser',
  'googledrive'
];

// Set the default driver activated at startup
ml.storage.currentDriver = 'browser';

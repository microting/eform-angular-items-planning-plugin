import { planningsPersistProvider } from './components/plannings/store';
import { pairingPersistProvider } from './components/pairing/store';

export const planningsStoreProviders = [
  planningsPersistProvider,
  pairingPersistProvider,
];

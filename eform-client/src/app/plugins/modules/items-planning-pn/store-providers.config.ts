import { planningsPersistProvider } from './components/plannings/store/plannings.store';
import { pairingPersistProvider } from './components/pairing/store/pairing-store';

export const planningsStoreProviders = [
  planningsPersistProvider,
  pairingPersistProvider,
];

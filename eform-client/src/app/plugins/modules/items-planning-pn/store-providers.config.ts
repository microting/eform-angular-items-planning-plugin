import { planningsPersistProvider } from './components/plannings/store';
import { pairingPersistProvider } from './components/pairing/store';
import { planningsReportPersistProvider } from './components/reports/store';

export const planningsStoreProviders = [
  planningsPersistProvider,
  pairingPersistProvider,
  planningsReportPersistProvider,
];

import {CommonDictionaryModel} from 'src/app/common/models';

export class PairingsModel {
  deviceUsers: CommonDictionaryModel[];
  pairings: PairingModel[];
}

export class PairingModel {
  planningId: number;
  planningName: string;
  pairingValues: PairingValueModel[];
}

export class PairingValueModel {
  deviceUserId: number;
  paired: boolean;
  latestCaseStatus: number | null;
  planningCaseSiteId: number | null;
  deviceUserName: string | null;
}

export class PlanningReiterationModel {
  repeatEvery: number;
  repeatType: number;
  dayOfWeek: number;
  dayOfMonth: number;
  repeatUntil: string;
  startDate: string;
  internalRepeatUntil: string;
  daysBeforeRedeploymentPushMessage: number;
  pushMessageEnabled: boolean;

  constructor() {
    this.pushMessageEnabled = true;
    this.daysBeforeRedeploymentPushMessage = 5;
  }
}

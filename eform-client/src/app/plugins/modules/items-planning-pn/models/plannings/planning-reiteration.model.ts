export class PlanningReiterationModel {
  repeatEvery: number;
  repeatType: number;
  dayOfWeek: number;
  dayOfMonth: number;
  repeatUntil: string;
  startDate: string;
  internalRepeatUntil: string;
  daysBeforeRedeploymentPushMessage: number;
  daysBeforeRedeploymentPushMessageRepeat: boolean;

  constructor() {
    this.daysBeforeRedeploymentPushMessageRepeat = false;
    this.daysBeforeRedeploymentPushMessage = 5;
  }
}

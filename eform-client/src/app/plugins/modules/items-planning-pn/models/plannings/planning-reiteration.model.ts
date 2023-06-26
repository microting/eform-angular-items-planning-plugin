export class PlanningReiterationModel {
  repeatEvery: number;
  repeatType: number;
  dayOfWeek: number;
  dayOfMonth: number;
  repeatUntil: string;
  startDate: string | Date;
  internalRepeatUntil: string | Date;
  daysBeforeRedeploymentPushMessage: number;
  pushMessageEnabled: boolean;
  pushMessageOnDeployment: boolean;

  constructor() {
    this.pushMessageEnabled = true;
    this.daysBeforeRedeploymentPushMessage = 0;
    this.pushMessageOnDeployment = true;
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestTrackingService {
  private readonly busyUserIds = new Set<number>();

  isBusy(userId: number): boolean {
    return this.busyUserIds.has(userId);
  }

  setBusy(userId: number): void {
    this.busyUserIds.add(userId);
  }

  setFree(userId: number): void {
    this.busyUserIds.delete(userId);
  }
}

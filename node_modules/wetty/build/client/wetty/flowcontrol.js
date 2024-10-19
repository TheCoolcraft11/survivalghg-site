export class FlowControlClient {
  constructor(ackBytes) {
    this.counter = 0;
    this.ackBytes = 262144;
    if (ackBytes) {
      this.ackBytes = ackBytes;
    }
  }
  needsCommit(length) {
    this.counter += length;
    if (this.counter >= this.ackBytes) {
      this.counter -= this.ackBytes;
      return true;
    }
    return false;
  }
}

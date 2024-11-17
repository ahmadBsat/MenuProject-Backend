import * as Sentry from "@sentry/node";

class SilentException {
  static captureException(
    event: any,
    extraInfo: Record<string, any> = {}
  ): void {
    Sentry.withScope((scope) => {
      scope.setExtras(extraInfo);
      Sentry.captureException(event);
    });
  }
}

export { SilentException };

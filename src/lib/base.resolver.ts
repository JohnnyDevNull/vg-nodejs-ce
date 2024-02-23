import { Logger } from '@nestjs/common';

export abstract class BaseResolver {
  protected logger: Logger;

  protected logWarning(obj: any, ...params: any[]) {
    const errorObj = {
      meta: obj.meta || obj.message || obj,
      params,
    };
    this.logger.warn(errorObj);
  }
}

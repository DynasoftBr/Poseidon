import * as util from "util";

import { SysMsg, SysError } from "../../common";

/**
 * A custom Error class
 * @class
 */
export class RequestError extends SysError {
    constructor(sysMsg: SysMsg, ...params: any[]) {
        super("request", sysMsg, ...params);
    }
}
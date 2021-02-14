export function error(msg: any): never { throw new Error(msg); }
export function bug(msg: any): never { throw new Error("Software bug:" + msg.toString()); }

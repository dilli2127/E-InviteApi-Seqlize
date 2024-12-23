import requestIp from "request-ip";

// eslint-disable-next-line import/prefer-default-export
export function getIp(req) {
    return requestIp.getClientIp(req);
}

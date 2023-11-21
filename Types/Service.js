"use strict";
/**
 * @typedef {Object} Service¨
 * @property {string} name - unique robot name
 * @property {string | null} ip - possible ip address (null if an IP conflict occurred)
 * @property {number} port - service port (default 31950)
 * @property {boolean | null} local - IP address (if known) is a link-local address
 * @property {boolean | null} ok - health status of the API server (null if not yet determined)
 * @property {boolean | null} serverOk - health status of the update server (null if not yet determined)
 * @property {boolean | null} advertising - whether robot is advertising over MDNS (null if not yet determined)
 * @property {Object | null} health - last good health response
 * @property {string} health.name - robot name
 * @property {string} health.api_version - API server version
 * @property {string} health.fw_version - robot firmware version
 * @property {string} health.system_version - robot system version
 * @property {Array<string>} health.logs - robot logs
 * @property {Object | null} serverHealth - last good update server health response
 * @property {string} serverHealth.name - robot name
 * @property {string} serverHealth.apiServerVersion - API server version
 * @property {string} serverHealth.updateServerVersion - update server version
 * @property {string} serverHealth.smoothieVersion - smoothie version
 * @property {string} serverHealth.systemVersion - robot system version
 *
 * This is a type definition for the Service object.
 * It is used to fetch the IP address of the robot.
 */
Object.defineProperty(exports, "__esModule", { value: true });

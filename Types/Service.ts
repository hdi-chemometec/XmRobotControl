type Service = {
    /** unique robot name */
    name: string,
  
    /** possible ip address (null if an IP conflict occurred) */
    ip: string | null,
  
    /** service port (deafult 31950) */
    port: number,
  
    /** IP address (if known) is a link-local address */
    local: boolean | null,
  
    /** health status of the API server (null if not yet determined) */
    ok: boolean | null,
  
    /** health status of the update server (null if not yet determined) */
    serverOk: boolean | null,
  
    /** whether robot is advertising over MDNS (null if not yet determined) */
    advertising: boolean | null,
  
    /** last good health response */
    health: {
      name: string,
      api_version: string,
      fw_version: string,
      system_version?: string,
      logs?: Array<string>,
    } | null,
  
    /** last good update server health response */
    serverHealth: {
      name: string,
      apiServerVersion: string,
      updateServerVersion: string,
      smoothieVersion: string,
      systemVersion: string,
    } | null,
  }

  export default Service;
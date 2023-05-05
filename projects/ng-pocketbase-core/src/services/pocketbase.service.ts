import {Injectable}       from "@angular/core";
import PocketBase         from "pocketbase";
import {PocketBaseConfig} from "../ng-pocketbase-core.module";


/**
 * This service is used to get information around PocketBase and to get the PocketBase instance.
 * @internal
 */
@Injectable(
  {
    providedIn: "root",
  },
)
export class PocketBaseService {
  /**
   * The PocketBase instance
   */
  private readonly pb: PocketBase;
  /**
   * The frontend url of the application
   */
  public readonly frontendUiUrl: string;
  /**
   * The backend url of the pocketbase api
   */
  public readonly backendUrl: string;
  /**
   * The redirect url of the application.
   * This is used to redirect the user to the application after a login with an external oauth provider
   */
  public readonly redirectUrl: string;

  /**
   * Constructor
   * @param config - the config service with the PocketBase configuration
   */
  constructor(private config: PocketBaseConfig) {
    this.frontendUiUrl = config.getFrontendUiUrl();
    this.backendUrl = config.getBackendUrl();
    this.backendUrl = config.getBackendUrl();
    this.redirectUrl = config.getRedirectUrl();

    this.pb = new PocketBase(config.getBackendUrl());
    this.pb.autoCancellation(false);
  }

  /**
   * Get the PocketBase instance
   * @returns the PocketBase instance
   */
  public getPB(): PocketBase {
    return this.pb;
  }

  /**
   * Get the public url of a file
   * @param idOrName - table name or id
   * @param id - record id
   * @param filename - filename
   * @returns public url of a file
   */
  public getPublicUrl(idOrName: string, id: string, filename: string): string {
    return `${this.backendUrl}/api/files/${idOrName}/${id}/${filename}`;
  }

  /**
   * Get the thumbnail url of a file
   *
   * @param idOrName - table name or id
   * @param id - record id
   * @param filename - filename
   * @returns thumbnail url of a file
   */
  public getThumbnail(idOrName: string, id: string, filename: string): string {
    return `${this.getPublicUrl(idOrName, id, filename)}?thumb=100x300`;
  }
}

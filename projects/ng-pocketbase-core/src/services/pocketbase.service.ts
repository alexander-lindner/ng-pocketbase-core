import {Injectable}       from "@angular/core";
import PocketBase         from "pocketbase";
import {PocketBaseConfig} from "../ng-pocketbase-core.module";


@Injectable(
  {
    providedIn: "root",
  },
)
export class PocketBaseService {
  private readonly pb: PocketBase;
  public readonly frontendUiUrl: string;
  public readonly backendUrl: string;
  public readonly redirectUrl: string;

  constructor(private config: PocketBaseConfig) {
    this.frontendUiUrl = config.getFrontendUiUrl();
    this.backendUrl = config.getBackendUrl();
    this.backendUrl = config.getBackendUrl();
    this.redirectUrl = config.getRedirectUrl();

    this.pb = new PocketBase(config.getBackendUrl());
    this.pb.autoCancellation(false);
  }

  public getPB(): PocketBase {
    return this.pb;
  }

  public getPublicUrl(idOrName: string, id: string, filename: string): string {
    return `${this.backendUrl}/api/files/${idOrName}/${id}/${filename}`;
  }

  public getThumbnail(idOrName: string, id: string, filename: string): string {
    return `${this.backendUrl}/api/files/${idOrName}/${id}/${filename}?thumb=100x300`;
  }
}

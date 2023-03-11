import {Injectable, OnDestroy}                                   from "@angular/core";
import {ListResult, Record, RecordSubscription, UnsubscribeFunc} from "pocketbase";
import {BehaviorSubject, from, Observable, Observer}             from "rxjs";
import {PocketBaseService}                                       from "./services/pocketbase.service";
import {BasicType}                                               from "./types";

/**
 * Basic CRUD service
 *
 * It allows to create, read, update and delete records from a collection.
 * Also, it uses pocketbase's realtime api to update the items list when a record is created, updated or deleted.
 *
 * @example
 * Basic usage:
 * ```typescript
 * export type Feed = BasicType & {
 *   name: string,
 *   quantity: number
 * }
 * @Injectable({providedIn: "root"})
 * export class FeedService extends BasicCrud<Feed> {}
 * ```
 */
@Injectable()
export abstract class BasicCrud<T extends BasicType> implements OnDestroy {
  protected _items: Array<T> = new Array<T>();
  protected items: BehaviorSubject<Array<T>> = new BehaviorSubject<Array<T>>([]);
  private promise: Promise<UnsubscribeFunc> = new Promise((resolve, reject) => {});
  // public readonly snapshot: Array<T>;

  protected constructor(protected pocketBaseService: PocketBaseService, protected idOrName: string) {
    this.subscribe();
  }

 protected abstract createItem(record: Record): T;

  public requestRecords(): Observable<void> {
    return from(
      this._requestRecords(1).then(() => {
        this.items.next(this._items);
      }),
    );
  }

  private async _requestRecords(page: number): Promise<void> {
    if (this._items.length > 0) {
      return;
    }
    let records: ListResult<Record> = await this.pocketBaseService.getPB()
                                                .collection(this.idOrName)
                                                .getList(page, 500, {});

    for (let record of records.items) {
      let item: T = this.createItem(record);
      this._items.push(item);
    }
    if (records.totalPages > records.page) {
      await this._requestRecords(records.page + 1);
    }
  }

  public getItems(): BehaviorSubject<Array<T>> {
    return this.items;
  }

  public create(data: FormData | T): Observable<Record> {
    return from(
      this.pocketBaseService.getPB()
          .collection(this.idOrName)
          .create(data)
          .then((record: Record) => {
            this._items.push(this.createItem(record));
            this.reloadItems();
            return record;
          }),
    );
  }

  public reload(): Promise<void> {
    this._items = new Array<T>();
    return this._requestRecords(1).then(() => {
      this.items.next(this._items);
    });
  }

  private reloadItems(): void {
    this.items.next(this._items);
  }


  public getById(id: string): Observable<T> {
    return new Observable((observer: Observer<T>) => {
      this._requestRecords(1).then(() => {
        let item: T | undefined = this._items.find((item: T) => item.id === id);
        if (item === undefined) {
          observer.error("Item not found");
          return;
        }
        observer.next(item);
        observer.complete();
        return {
          unsubscribe() {
          },
        };
      });
    });
  }

  public update(id: string, data: any): Observable<Record> {
    return from(
      this.pocketBaseService.getPB()
          .collection(this.idOrName)
          .update(id, data)
          .then((record: Record) => {
            this._internalUpdateData(id, record);
            this.reloadItems();
            return record;
          }),
    );
  }

  public delete(id: string): Observable<boolean> {
    return from(
      this.pocketBaseService
          .getPB()
          .collection(this.idOrName)
          .delete(id)
          .then((value: boolean) => {
            if (value) {
              this._items = this._items.filter((item: T) => item.id !== id);
              this.reloadItems();
            }
            return value;
          }),
    );
  }

  private _internalUpdateData(id: string, record: Record) {
    let item: T | undefined = this._items.find((item: T) => item.id === id);
    if (item === undefined) {
      return;
    }
    for (let key in item) {
      // @ts-ignore
      item[key] = record[key];
    }
    this.items.next(this._items);
  }

  public subscribe(): Observable<UnsubscribeFunc> {
    if (this.promise === undefined) {
      this.promise = this.pocketBaseService
                         .getPB()
                         .collection(this.idOrName)
                         .subscribe("*", (e: RecordSubscription<Record>) => {
                           switch (e.action) {
                             case "create":
                               const id = e.record.id;
                               if(this._items.find(value => value.id === id) === undefined) {
                                 this._items.push(this.createItem(e.record));
                               }
                               break;
                             case "update":
                               const index2 = this._items.findIndex(value => value.id === e.record.id);
                               if (index2 > -1) {
                                 this._items.splice(index2, 1);
                               }
                               this._items.push(this.createItem(e.record));
                               break;
                             case "delete":
                               const index = this._items.findIndex(value => value.id === e.record.id);
                               if (index > -1) {
                                 this._items.splice(index, 1);
                               }
                               break;
                             default:
                               this.reload();
                           }
                           this.items.next(this._items);
                         });
    }
    return from(this.promise);
  }

  public unsubscribe(): Observable<void> {
    return from(
      this.pocketBaseService.getPB()
          .collection(this.idOrName)
          .unsubscribe("*"),
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}

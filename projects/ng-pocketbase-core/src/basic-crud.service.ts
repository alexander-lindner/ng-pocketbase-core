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
  /**
   * the internal list of items.
   * Only interact with this list if you know what you are doing.
   * @type {Array<T>} items
   * @protected
   */
  protected _items: Array<T> = new Array<T>();
  /**
   * The public list of items.
   *
   * Use this list to interact with the items.
   *
   * @type {BehaviorSubject<Array<T>>} items
   */
  public readonly items: BehaviorSubject<Array<T>> = new BehaviorSubject<Array<T>>([]);

  /**
   * The subscription to the pocketbase realtime api.
   * @type {Promise<UnsubscribeFunc>} promise
   * @private
   */
  private promise: Promise<UnsubscribeFunc> = new Promise((resolve, reject) => {});
  /**
   * The flag allows to know if the subscription to the realtime api is already set.
   * @type {boolean} true if the subscription is already set
   * @private
   */
  private promiseAlreadySet: boolean = false;

  // public readonly snapshot: Array<T>;

  /**
   * initializes the service.
   * @param {PocketBaseService} pocketBaseService internal pocketbase service
   * @param {string} idOrName collection id or name
   * @protected
   */
  protected constructor(protected pocketBaseService: PocketBaseService, protected idOrName: string) {
    this.subscribe();
  }

  /**
   * Transforms a pocketbase record into an `item: T`.
   *
   * This method is called when a record is created, updated/change or loaded.
   * This is necessary because the record received by the api may have the wrong format, for example when using pocketbase's relations or files types.
   * @param {Record} record pocketbase record
   * @returns {T} your item representation
   * @protected
   */
  protected abstract createItem(record: Record): T;

  /**
   * load the items list.
   * @returns { Observable<void> } observable that emits when the items list is loaded
   * @protected
   */
  protected requestRecords(): Observable<void> {
    return from(
      this._requestRecords(1).then(() => this.items.next(this._items)),
    );
  }

  /**
   * Creates a new item in the collection.
   * @param {FormData | T} data data to create the item
   * @returns {Observable<T>} observable that emits the created item
   */
  public create(data: FormData | T): Observable<T> {
    return from(
      this.pocketBaseService
          .getPB()
          .collection(this.idOrName)
          .create(data)
          .then((record: Record) => {
            this._items.push(this.createItem(record));
            this.reloadItems();
            return this.createItem(record);
          }),
    );
  }

  /**
   * requests a full reload of the items list.
   *
   * This shouldn't be necessary, because the items list is automatically updated in realtime.
   * @returns {Observable<void>} observable that emits when the items list is reloaded
   */
  public reload(): Observable<void> {
    this._items = new Array<T>();
    return from(
      this._requestRecords(1).then(() => {
        this.items.next(this._items);
      }),
    );
  }


  /**
   * Get an item by id.
   *
   * Because the items may not be loaded yet, it returns an observable that emits the item when it is loaded.
   *
   * @param {string} id item id
   * @returns {Observable<T>} observable that emits the item
   */
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

  /**
   * Update any data of an item.
   *
   * It is not necessary to send the whole item, only the data to update is needed.
   * It also updates the current items list.
   *
   * @param {string} id item id to update
   * @param data data to update
   * @returns {Observable<T>} observable that emits the updated item
   */
  public update(id: string, data: any): Observable<T> {
    return from(
      this.pocketBaseService
          .getPB()
          .collection(this.idOrName)
          .update(id, data)
          .then((record: Record) => {
            this._internalUpdateData(id, record);
            this.reloadItems();
            return this.createItem(record);
          }),
    );
  }

  /**
   * Delete an item by id from the collection.
   *
   * It also updates the current items list.
   *
   * @param {string} id item id to delete
   * @returns {Observable<boolean>} observable that emits true if the item was deleted, false otherwise
   */
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

  /**
   * loads the initial items list by fetching all items from the api.
   *
   *  This method is called automatically when the service is created.
   *  The request is spit into multiple requests if the collection has more than 500 items.
   *
   * @param {number} page the page number to fetch
   * @returns {Promise<void>}
   * @private
   */
  private async _requestRecords(page: number): Promise<void> {
    if (this._items.length > 0) {
      return;
    }
    let records: ListResult<Record> = await this.pocketBaseService
                                                .getPB()
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

  /**
   * Sends the current internal items list to the public items observable.
   * @private
   */
  private reloadItems(): void {
    this.items.next(this._items);
  }

  /**
   * Update the current items list with the data of a record.
   * @param {string} id
   * @param {Record} record
   * @private
   */
  private _internalUpdateData(id: string, record: Record) {
    let currentItem: T | undefined = this._items.find((item: T) => item.id === id);
    if (currentItem === undefined) {
      return;
    }
    let newItem: T = this.createItem(record);
    for (let key in currentItem) {
      // @ts-ignore
      currentItem[key] = newItem[key];
    }
    this.items.next(this._items);
  }

  /**
   * Subscribe to the pocketbase realtime api.
   * @returns {Observable<UnsubscribeFunc>} observable that emits the unsubscribe function when the subscription is ready
   * @private
   */
  private subscribe(): Observable<UnsubscribeFunc> {
    if (!this.promiseAlreadySet) {
      this.promise =
        this.pocketBaseService
            .getPB()
            .collection(this.idOrName)
            .subscribe(
              "*",
              (e: RecordSubscription<Record>) => {
                switch (e.action) {
                  case "create":
                    const id: String = e.record.id;
                    if (this._items.find((value: T) => value.id === id) === undefined) {
                      this._items.push(this.createItem(e.record));
                    }
                    break;
                  case "update":
                    const index2: number = this._items.findIndex((value: T) => value.id === e.record.id);
                    if (index2 > -1) {
                      this._items.splice(index2, 1);
                    }
                    this._items.push(this.createItem(e.record));
                    break;
                  case "delete":
                    const index: number = this._items.findIndex((value: T) => value.id === e.record.id);
                    if (index > -1) {
                      this._items.splice(index, 1);
                    }
                    break;
                  default:
                    this.reload();
                }
                this.items.next(this._items);
              },
            );
      this.promiseAlreadySet = true;
    }
    return from(this.promise);
  }

  /**
   * Unsubscribe from the pocketbase realtime api.
   * @returns {Observable<void>} observable that emits when the subscription is removed
   * @private
   */
  private unsubscribe(): Observable<void> {
    return from(
      this.pocketBaseService
          .getPB()
          .collection(this.idOrName)
          .unsubscribe("*"),
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}

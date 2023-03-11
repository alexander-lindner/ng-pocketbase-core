# @ng-pocketbase/core

This library provides a set of components and services for the usage with [Pocketbase](https://github.com/pocketbase/pocketbase).
It heavily uses pocketbase's realtime api, so any changes made to the database will be reflected in the app instantly without polling. 
## Installation
`yarn add @ng-pocketbase/core` or `npm install @ng-pocketbase/core`

## Examples
```typescript
@Injectable({providedIn: "root"})
export class DetailsService extends BasicCrud<Detail> {
  constructor(pbs: PocketBaseService) {
    super(pbs, "details");
    this.requestRecords();
  }

  protected createItem(record: Record): Detail {
    return {
      id: record.id,
      feed: record.feed,
      weight: parseInt(record.weight),
      name: record.name,
    };
  }
}
```
Now you can use it like so

```typescript
export class DetailsComponent implements OnInit {
    constructor(private DetailsService: DetailsService) {
    }

    public ngOnInit(): void {
        this.DetailsService.getItems().subscribe((value: Array<Detail>) => {
            this.details = value;
        });

        this.DetailsService.create({...}).subscribe((value: Detail) => { console.log(value.id); // fdsafdsadadfs });
        this.DetailsService.getById("fdsafdsadadfs").subscribe((value: Detail) => { });
        this.DetailsService.update("fdsafdsadadfs", {name: "test"}).subscribe((value: Detail) => { });
        this.DetailsService.delete("fdsafdsadadfs").subscribe((success: boolean) => { });
    }
}
```
## License
Mozilla Public License Version 2.0

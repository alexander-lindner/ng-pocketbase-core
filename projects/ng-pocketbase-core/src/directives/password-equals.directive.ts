import {Directive, Input, OnDestroy}                                          from "@angular/core";
import {AbstractControl, NG_VALIDATORS, NgModel, ValidationErrors, Validator} from "@angular/forms";
import {Subscription}                                                         from "rxjs";

@Directive(
  {
    selector: "[passwordEquals]",
    providers: [{provide: NG_VALIDATORS, useExisting: passwordEqualsDirective, multi: true}],
  },
)
export class passwordEqualsDirective implements Validator, OnDestroy {
  //@ts-ignore
  @Input("passwordEquals") passwordEquals: NgModel;
  private sub: Subscription = new Subscription();

  validate(group: AbstractControl): ValidationErrors | null {
    if (this.sub === null) {
      this.sub = this.passwordEquals.update.subscribe((value: any) => {
        group.updateValueAndValidity();
      });
    }
    return group.value === this.passwordEquals.value ? null : {notSame: true};
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

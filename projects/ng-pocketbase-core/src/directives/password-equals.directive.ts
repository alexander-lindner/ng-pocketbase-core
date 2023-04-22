import {Directive, Input, OnDestroy}                                          from "@angular/core";
import {AbstractControl, NG_VALIDATORS, NgModel, ValidationErrors, Validator} from "@angular/forms";
import {Subscription}                                                         from "rxjs";

/**
 * A simple validator that checks if the value of the input field is equal to the value of another input field.
 *
 * @example
 * Basic usage:
 * ```typescript
 *
 * <input type="password"
 *                  placeholder="*******"
 *                  required
 *                  ngModel
 *                  name="password"
 *                  id="passwordchange"
 *                  #passwordChange="ngModel">
 *
 *   <input type="password"
 *                  placeholder="*******"
 *                  required
 *                  ngModel
 *                  name="password2"
 *                  id="passwordchange2"
 *                  [passwordEquals]="passwordChange"
 *                  #passwordChange2="ngModel">
 * ```
 */
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

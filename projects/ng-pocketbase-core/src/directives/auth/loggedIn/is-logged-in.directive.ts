import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
}                    from "@angular/core";
import {AuthService} from "../../../services/auth.service";
import {User}        from "../../../types";


@Directive(
  {
    selector: "[isLoggedIn]",
  },
)
export class IsLoggedInDirective implements OnInit, OnDestroy {
  @Input("isLoggedIn") set isLoggedIn(condition: boolean) {
    if ((this.currentlyLoggedIn() && condition) || (this.currentlyLoggedOff() && !condition)) {
      this.vcRef.createEmbeddedView(this.templateRef);
    } else {
      if (this.elementRef.nativeElement.children !== undefined) {
        for (let child of this.elementRef.nativeElement.children) {
          this.vcRef.clear();
        }
      }
    }
  }


  constructor(
    private authService: AuthService<User>,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private templateRef: TemplateRef<any>,
    private vcRef: ViewContainerRef
  ) {}

  ngOnDestroy(): void {}

  private currentlyLoggedIn() {
    return this.authService.snapshot.loggedIn;
  }

  private currentlyLoggedOff() {
    return !this.currentlyLoggedIn();
  }

  ngOnInit(): void {}

  // @HostListener("click") onClick(event: Event) {
  //   if (this.currentlyLoggedOff()) {
  //
  //   }
  // }
  //
  // @HostBinding("style.backgroundColor") backgroundColor: string = "";
}

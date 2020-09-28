import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';

@Directive({
  selector: '[nwtBadge]'
})
export class BadgeDirective implements OnInit {
  // private property to store person value
  private _person: any;

  /**
   * Component constructor
   */
  constructor(private _el: ElementRef, private _rd: Renderer2) {
  }

  /**
   * Sets private property _person
   */
  @Input()
  set person(person: any) {
    this._person = person;
  }

  /**
   * OnInit implementation
   */
  ngOnInit(): void {
    of(this._person)
      .pipe(
        filter(_ => !!_ && !!_.isManager)
      )
      .subscribe(_ =>
        this._rd.setProperty(this._el.nativeElement, 'innerHTML', '<i class="material-icons">supervisor_account</i>'));
  }
}

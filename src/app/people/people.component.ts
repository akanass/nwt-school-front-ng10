import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { Person } from '../shared/interfaces/person';
import { PeopleService } from '../shared/services/people.service';
import { Router } from '@angular/router';

@Component({
  selector: 'nwt-people',
  templateUrl: './people.component.html',
  styleUrls: [ './people.component.css' ]
})
export class PeopleComponent implements OnInit {
  // private property to store people value
  private _people: Person[];
  // private property to store dialogStatus value
  private _dialogStatus: string;
  // private property to store dialog reference
  private _peopleDialog: MatDialogRef<DialogComponent>;
  // private property to store view value
  private _view: string;

  /**
   * Component constructor
   */
  constructor(private _router: Router, private _peopleService: PeopleService, private _dialog: MatDialog) {
    this._people = [];
    this._dialogStatus = 'inactive';
    this._view = 'card';
  }

  /**
   * Returns private property _people
   */
  get people(): Person[] {
    return this._people;
  }

  /**
   * Returns private property _dialogStatus
   */
  get dialogStatus(): string {
    return this._dialogStatus;
  }

  /**
   * Returns private property _view
   */
  get view(): string {
    return this._view;
  }

  /**
   * OnInit implementation
   */
  ngOnInit(): void {
    this._peopleService
      .fetch().subscribe((people: Person[]) => this._people = people);
  }

  /**
   * Function to delete one person
   */
  delete(person: Person): void {
    this._peopleService
      .delete(person.id)
      .subscribe(_ => this._people = this._people.filter(__ => __.id !== _));
  }

  /**
   * Function to display modal
   */
  showDialog(): void {
    // set dialog status
    this._dialogStatus = 'active';

    // open modal
    this._peopleDialog = this._dialog.open(DialogComponent, {
      width: '500px',
      disableClose: true
    });

    // subscribe to afterClosed observable to set dialog status and do process
    this._peopleDialog.afterClosed()
      .pipe(
        filter(_ => !!_),
        map((_: Person) => {
          // delete obsolete attributes in original object which are not required in the API
          delete _.id;
          delete _.photo;

          return _;
        }),
        mergeMap(_ => this._add(_))
      )
      .subscribe(
        (people: Person[]) => this._people = people,
        _ => this._dialogStatus = 'inactive',
        () => this._dialogStatus = 'inactive'
      );
  }

  /**
   * Function to switch view
   */
  switchView(): void {
    this._view = (this._view === 'card') ? 'list' : 'card';
  }

  /**
   * Function to navigate to current person
   */
  navigate(id: string): void {
    this._router.navigate([ '/person', id ]);
  }

  /**
   * Add new person and fetch all people to refresh the list
   */
  private _add(person: Person): Observable<Person[]> {
    return this._peopleService
      .create(person)
      .pipe(
        mergeMap(_ => this._peopleService.fetch())
      );
  }
}

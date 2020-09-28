import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { defaultIfEmpty, filter, mergeMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { Person } from '../shared/interfaces/person';

@Component({
  selector: 'nwt-people',
  templateUrl: './people.component.html',
  styleUrls: [ './people.component.css' ]
})
export class PeopleComponent implements OnInit {
  // private property to store people value
  private _people: Person[];
  // private property to store all backend URLs
  private readonly _backendURL: any;
  // private property to store dialogStatus value
  private _dialogStatus: string;
  // private property to store dialog reference
  private _peopleDialog: MatDialogRef<DialogComponent>;

  /**
   * Component constructor
   */
  constructor(private _http: HttpClient, private _dialog: MatDialog) {
    this._people = [];
    this._backendURL = {};
    this._dialogStatus = 'inactive';

    // build backend base url
    let baseUrl = `${environment.backend.protocol}://${environment.backend.host}`;
    if (environment.backend.port) {
      baseUrl += `:${environment.backend.port}`;
    }

    // build all backend urls
    Object.keys(environment.backend.endpoints).forEach(k => this._backendURL[ k ] = `${baseUrl}${environment.backend.endpoints[ k ]}`);
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
   * OnInit implementation
   */
  ngOnInit(): void {
    this._getAll().subscribe((people: Person[]) => this._people = people);
  }

  /**
   * Function to delete one person
   */
  delete(person: Person): void {
    this._http.delete(this._backendURL.onePeople.replace(':id', person.id))
      .subscribe(_ => this._people = this._people.filter(__ => __.id !== person.id));
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
        mergeMap(_ => this._add(_))
      )
      .subscribe(
        (people: Person[]) => this._people = people,
        _ => this._dialogStatus = 'inactive',
        () => this._dialogStatus = 'inactive'
      );
  }

  /**
   * Add new person and fetch all people to refresh the list
   */
  private _add(person: Person): Observable<Person[]> {
    return this._http.post(this._backendURL.allPeople, person, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
      .pipe(mergeMap(_ => this._getAll()));
  }

  /**
   * Returns Observable of all people
   */
  private _getAll(): Observable<Person[]> {
    return this._http.get(this._backendURL.allPeople)
      .pipe(
        filter(_ => !!_),
        defaultIfEmpty([])
      );
  }
}

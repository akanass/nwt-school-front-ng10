import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Person } from '../shared/interfaces/person';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'nwt-update',
  templateUrl: './update.component.html',
  styleUrls: [ './update.component.css' ]
})
export class UpdateComponent implements OnInit {
  // private property to store all backend URLs
  private readonly _backendURL: any;
  // private property to store dialog reference
  private _peopleDialog: MatDialogRef<DialogComponent>;

  /**
   * Component constructor
   */
  constructor(private _route: ActivatedRoute, private _router: Router, private _http: HttpClient, private _dialog: MatDialog) {
    this._backendURL = {};

    // build backend base url
    let baseUrl = `${environment.backend.protocol}://${environment.backend.host}`;
    if (environment.backend.port) {
      baseUrl += `:${environment.backend.port}`;
    }

    // build all backend urls
    Object.keys(environment.backend.endpoints).forEach(k => this._backendURL[ k ] = `${baseUrl}${environment.backend.endpoints[ k ]}`);
  }

  /**
   * OnInit implementation
   */
  ngOnInit(): void {
    this._route.params
      .pipe(
        map((params: any) => params.id),
        mergeMap((id: string) => this._fetchOne(id))
      )
      .subscribe((person: Person) => this._initModal(person));
  }

  /**
   * Initialize modal process
   */
  private _initModal(person: Person): void {
    // create modal with initial data inside
    this._peopleDialog = this._dialog.open(DialogComponent, {
      width: '500px',
      disableClose: true,
      data: person
    });

    // subscribe to afterClosed observable to set dialog status and do process
    this._peopleDialog.afterClosed()
      .pipe(
        filter(_ => !!_),
        map((_: Person) => {
          // get person id
          const id = _.id;
          // delete obsolete attributes in original object which are not required in the API
          delete _.id;
          delete _.photo;

          return { id, update: _ };
        }),
        mergeMap(_ => this._update(_.id, _.update))
      )
      .subscribe(
        () => undefined,
        () => this._router.navigate([ '/people' ]),
        () => this._router.navigate([ '/people' ])
      );
  }

  /**
   * Update a person in the list
   */
  private _update(id: string, person: Person): Observable<Person> {
    return this._http.put<Person>(
      this._backendURL.onePeople.replace(':id', id),
      person,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  /**
   * Returns an observable fetchs one person by id
   */
  private _fetchOne(id: string): Observable<Person> {
    return this._http.get<Person>(this._backendURL.onePeople.replace(':id', id));
  }
}

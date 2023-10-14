import { Component, OnInit } from '@angular/core';
import { ServersService } from './servers/servers.service';
import { BehaviorSubject, Observable, catchError, map, of, startWith, tap } from 'rxjs';
import { CustomResponse } from './interfaces/custom-response';
import { AppState } from './interfaces/app-state';
import { DataState } from './enums/data-state.enum';
import { Status } from './enums/status.enum';
import { faServer, faSpinner, faTrash, faChevronDown, faCirclePlus, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { createMask } from '@ngneat/input-mask';
import { Server } from './interfaces/server';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NotifierService } from 'angular-notifier';
import { NotificationService } from './notification/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly dataState = DataState;
  readonly status = Status;
  readonly serverIcon = faServer;
  readonly spinnerIcon = faSpinner;
  readonly deleteIcon = faTrash;
  readonly chvronIcon = faChevronDown;
  readonly plusIcon = faCirclePlus;
  readonly lightIconMode = faSun;
  readonly darkIconMode = faMoon;

  appState$!: Observable<AppState<CustomResponse>>;
  title = 'Server Manager';
  theme: 'light' | 'dark' = 'light';
  tableId = crypto.randomUUID();
  showErrorToast = true;
  displayedColumns: string[] = ['image', 'name', 'ip address', 'memory', 'type', 'status', 'ping', 'actions'];

  private filterSubject = new BehaviorSubject<string>('');
  filterStatus$ = this.filterSubject.asObservable();
  dataSubject = new BehaviorSubject<CustomResponse>(null);
  private isSavingServer = new BehaviorSubject<boolean>(false);
  isSavingServer$ = this.isSavingServer.asObservable();
  ipAddressMask = createMask<string>({ alias: 'ip' });

  constructor(
    private serversService: ServersService,
    private modalService: NgbModal,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.appState$ = this.serversService.servers$
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.notificationService.onDefault(response.message);
          return { dataState: DataState.SUCCESS, appData: { ...response, data: { servers: response.data.servers.reverse() } } };
        }),
        startWith({ dataState: DataState.LOADING }),
        catchError(error => {
          this.notificationService.onError(error);
          return of({ dataState: DataState.ERROR, error });
        })
      );
  }

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serversService.ping$(ipAddress)
      .pipe(
        map(response => {
          const servers = this.dataSubject.value.data.servers;
          const index = servers.findIndex(server => server.id === response.data.server.id);
          this.dataSubject.value.data.servers[index] = response.data.server;
          this.filterSubject.next('');
          this.notificationService.onSuccess(response.message);
          return { dataState: DataState.SUCCESS, appData: this.dataSubject.value };
        }),
        startWith({ dataState: DataState.SUCCESS, appData: this.dataSubject.value }),
        catchError(error => {
          this.filterSubject.next('');
          this.notificationService.onError(error);
          return of({ dataState: DataState.ERROR, error });
        })
      );
  }

  filterServers(status: Status): void {
    this.appState$ = this.serversService.filter$(status, this.dataSubject.value)
      .pipe(
        map(response => {
          this.notificationService.onSuccess(response.message);
          return { dataState: DataState.SUCCESS, appData: response };
        }),
        startWith({ dataState: DataState.LOADING, appData: this.dataSubject.value }),
        catchError(error => {
          this.notificationService.onError(error);
          return of({ dataState: DataState.ERROR, error });
        })
      );
  }

  saveServer(form: NgForm): void {
    this.isSavingServer.next(true);
    this.appState$ = this.serversService.save$(form.value)
      .pipe(
        map(response => {
          const server = response.data.server;
          const servers = this.dataSubject.value.data.servers;
          this.dataSubject.next({ ...response, data: { servers: [server, ...servers] } });
          this.modalService.dismissAll();
          this.isSavingServer.next(false);
          form.resetForm({ status: this.status.SERVER_DOWN });
          this.notificationService.onSuccess(response.message);
          return { dataState: DataState.SUCCESS, appData: response };
        }),
        startWith({ dataState: DataState.SUCCESS, appData: this.dataSubject.value }),
        catchError(error => {
          this.isSavingServer.next(false);
          this.notificationService.onError(error);
          return of({ dataState: DataState.ERROR, error });
        })
      );
  }

  deleteServer(server: Server): void {
    this.appState$ = this.serversService.delete$(server.id)
      .pipe(
        map(response => {
          const servers = this.dataSubject.value.data.servers.filter(_server => _server.id !== server.id);
          this.dataSubject.next({ ...response, data: { servers: servers } });
          this.notificationService.onSuccess(response.message);
          return { dataState: DataState.SUCCESS, appData: this.dataSubject.value };
        }),
        startWith({ dataState: DataState.SUCCESS, appData: this.dataSubject.value }),
        catchError(error => {
          this.notificationService.onError(error);
          return of({ dataState: DataState.ERROR, error });
        })
      );
  }

  printReport(): void {
    const doc = new jsPDF();
    const table = document.getElementById(this.tableId) as HTMLTableElement;
    autoTable(doc, { html: table });
    doc.save(`${this.title}-${Date.now()}`);
  }

  onSwitch(): void {
    if (this.theme === 'light') {
      this.theme = 'dark';
      return;
    }

    this.theme = 'light';
  }

  open(content: unknown) {
    this.modalService.open(content);
  }
}

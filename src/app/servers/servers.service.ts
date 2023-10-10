import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core'; import { Observable, catchError, tap, throwError } from 'rxjs';
import { CustomResponse } from '../interfaces/custom-response';
import { Server } from '../interfaces/server';
import { Status } from '../enums/status.enum';

@Injectable({ providedIn: 'root' })
export class ServersService {
  private readonly apiUrl = "http://localhost:8080";
  private readonly serversEndpoints = 'api/v1/servers';

  constructor(private http: HttpClient) { }

  servers$ = <Observable<CustomResponse>>
    this.http
      .get<CustomResponse>(`${this.apiUrl}/${this.serversEndpoints}`)
      .pipe(tap(console.log), catchError(this.handleErrors));

  save$ = (server: Server) => <Observable<CustomResponse>>
    this.http
      .post<CustomResponse>(`${this.apiUrl}/${this.serversEndpoints}`, server)
      .pipe(tap(console.log), catchError(this.handleErrors));

  ping$ = (ipAddress: string) => <Observable<CustomResponse>>
    this.http
      .get<CustomResponse>(`${this.apiUrl}/${this.serversEndpoints}/ping/${ipAddress}`)
      .pipe(tap(console.log), catchError(this.handleErrors));

  delete$ = (serverId: number) => <Observable<CustomResponse>>
    this.http
      .delete<CustomResponse>(`${this.apiUrl}/${this.serversEndpoints}/${serverId}`)
      .pipe(tap(console.log), catchError(this.handleErrors));

  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      subscriber => {
        if (!response.data.servers) return subscriber.complete();

        if (status === Status.ALL)
          subscriber.next({ ...response, message: `Servers filtered by ${status} status.` });

        const filteredServers = response.data.servers?.filter(server => server.status === status);
        const filteredServersMessage = `Servers filtered by ${status} status.`;
        const noServersFoundMessage = `No servers of ${status} found.`;
        const message = filteredServers?.length > 0 ? filteredServersMessage : noServersFoundMessage;

        subscriber.next({ ...response, message, data: { servers: filteredServers } });

        return subscriber.complete();
      }
    )

  private handleErrors(error: HttpErrorResponse): Observable<Record<string, unknown>> {
    console.log(error);
    const message = `An error occured - Error code: ${error.status}`;
    return throwError(() => message);
  }
}

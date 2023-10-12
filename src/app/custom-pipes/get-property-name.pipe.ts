import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getPropertyName'
})
export class GetPropertyNamePipe implements PipeTransform {
  transform(value: any): string {
    const property = { [value]: null };
    const name = Object.keys(property)[0];
    return name;
  }
}

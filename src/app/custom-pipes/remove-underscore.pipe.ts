import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeUnderscore'
})
export class RemoveUnderscorePipe implements PipeTransform {

  transform(value: string, replacement: string = ''): string {
    return value.replace(/_/g, replacement);
  }

}

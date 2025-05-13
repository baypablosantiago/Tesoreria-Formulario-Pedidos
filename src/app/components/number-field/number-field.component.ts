import { Component, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { merge } from 'rxjs';

@Component({
  selector: 'app-number-field',
  imports: [FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './number-field.component.html',
  styleUrl: './number-field.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class NumberFieldComponent {
  readonly field = new FormControl('', [
  Validators.required,
  Validators.pattern(/^\d+$/) // solo dígitos positivos (sin decimales ni negativos)
]);

  errorMessage = signal('');

  constructor() {
    merge(this.field.statusChanges, this.field.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  allowOnlyNumbers(event: KeyboardEvent) {
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];
  const isNumber = /^[0-9]$/.test(event.key);
  if (!isNumber && !allowedKeys.includes(event.key)) {
    event.preventDefault();
  }
}

  updateErrorMessage() {
    if (this.field.hasError('required')) {
      this.errorMessage.set('Requerido.');
    } else {
      this.errorMessage.set('');
    }
  }

}

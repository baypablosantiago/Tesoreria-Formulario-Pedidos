import { Component, forwardRef, ViewEncapsulation, signal } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

@Component({
  selector: 'app-text-field',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextFieldComponent),
      multi: true
    }
  ]
})

export class TextFieldComponent implements ControlValueAccessor {
  readonly field = new FormControl('');
  errorMessage = signal('');

  private onChange: (_: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    merge(this.field.statusChanges, this.field.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.onChange(this.field.value);
      });
  }

  writeValue(value: any): void {
    this.field.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.field.disable() : this.field.enable();
  }
}

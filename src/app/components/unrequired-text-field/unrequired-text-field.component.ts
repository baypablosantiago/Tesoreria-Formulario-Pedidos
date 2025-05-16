import { Component, forwardRef, ViewEncapsulation } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unrequired-text-field',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './unrequired-text-field.component.html',
  styleUrl: './unrequired-text-field.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UnrequiredTextFieldComponent),
      multi: true
    }
  ]
})
export class UnrequiredTextFieldComponent implements ControlValueAccessor {
  readonly field = new FormControl('');

  private onChange: (_: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.field.valueChanges
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

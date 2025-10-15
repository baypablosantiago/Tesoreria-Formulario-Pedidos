import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FundingRequestCreateDto } from '../../models';

export interface ConfirmationDialogData {
  requests: FundingRequestCreateDto[];
}

interface GroupedByDA {
  da: number;
  requests: FundingRequestCreateDto[];
  total: number;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  groupedByDA: GroupedByDA[] = [];
  grandTotal = 0;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    this.processRequests();
  }

  private processRequests(): void {
    // Agrupar por DA
    const groups = new Map<number, FundingRequestCreateDto[]>();

    this.data.requests.forEach(req => {
      if (!groups.has(req.da)) {
        groups.set(req.da, []);
      }
      groups.get(req.da)!.push(req);
    });

    // Calcular totales
    this.groupedByDA = Array.from(groups.entries()).map(([da, requests]) => {
      const total = requests.reduce((sum, r) => sum + r.amount, 0);
      return { da, requests, total };
    });

    // Ordenar por DA
    this.groupedByDA.sort((a, b) => a.da - b.da);

    this.grandTotal = this.groupedByDA.reduce((sum, g) => sum + g.total, 0);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

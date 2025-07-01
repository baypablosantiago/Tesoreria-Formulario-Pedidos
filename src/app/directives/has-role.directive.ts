import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { RolesService } from '../services/roles.service';

@Directive({
  selector: '[hasRole]',
   standalone: true
})
export class HasRoleDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rolesService: RolesService
  ) {}

  @Input() set hasRole(requiredRole: string) {
    if (this.rolesService.hasRole(requiredRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
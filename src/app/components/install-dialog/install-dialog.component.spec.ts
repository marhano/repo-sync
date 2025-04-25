import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallDialogComponent } from './install-dialog.component';

describe('InstallDialogComponent', () => {
  let component: InstallDialogComponent;
  let fixture: ComponentFixture<InstallDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

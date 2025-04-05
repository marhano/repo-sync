import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueDialogComponent } from './issue-dialog.component';

describe('IssueDialogComponent', () => {
  let component: IssueDialogComponent;
  let fixture: ComponentFixture<IssueDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

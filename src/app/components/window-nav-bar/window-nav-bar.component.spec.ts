import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowNavBarComponent } from './window-nav-bar.component';

describe('WindowNavBarComponent', () => {
  let component: WindowNavBarComponent;
  let fixture: ComponentFixture<WindowNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindowNavBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WindowNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

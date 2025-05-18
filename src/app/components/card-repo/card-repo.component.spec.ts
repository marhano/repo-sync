import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRepoComponent } from './card-repo.component';

describe('CardRepoComponent', () => {
  let component: CardRepoComponent;
  let fixture: ComponentFixture<CardRepoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardRepoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardRepoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

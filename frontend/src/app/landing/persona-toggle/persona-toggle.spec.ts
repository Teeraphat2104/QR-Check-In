import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaToggle } from './persona-toggle';

describe('PersonaToggle', () => {
  let component: PersonaToggle;
  let fixture: ComponentFixture<PersonaToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaToggle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonaToggle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

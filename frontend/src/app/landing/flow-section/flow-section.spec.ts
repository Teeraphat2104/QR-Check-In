import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowSection } from './flow-section';

describe('FlowSection', () => {
  let component: FlowSection;
  let fixture: ComponentFixture<FlowSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanSimulation } from './scan-simulation';

describe('ScanSimulation', () => {
  let component: ScanSimulation;
  let fixture: ComponentFixture<ScanSimulation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanSimulation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanSimulation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

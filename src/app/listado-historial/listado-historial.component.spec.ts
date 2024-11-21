import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoHistorialComponent } from './listado-historial.component';

describe('ListadoHistorialComponent', () => {
  let component: ListadoHistorialComponent;
  let fixture: ComponentFixture<ListadoHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaPublicacion } from './pagina-publicacion';

describe('PaginaPublicacion', () => {
  let component: PaginaPublicacion;
  let fixture: ComponentFixture<PaginaPublicacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaPublicacion],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaPublicacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { PocketBaseService } from './pocketbase.service';

describe('PocketbaseService', () => {
  let service: PocketBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PocketBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

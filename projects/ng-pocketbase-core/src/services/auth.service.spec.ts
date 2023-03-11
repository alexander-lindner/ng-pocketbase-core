import { TestBed } from '@angular/core/testing';

import {AuthService, User} from "./auth.service";

describe('AuthService', () => {
  let service: AuthService<User>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

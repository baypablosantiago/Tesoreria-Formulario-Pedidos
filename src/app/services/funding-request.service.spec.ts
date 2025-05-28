import { TestBed } from '@angular/core/testing';

import { FundingRequestService } from './funding-request.service';

describe('FundingRequestService', () => {
  let service: FundingRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FundingRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

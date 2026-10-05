import { Test, TestingModule } from '@nestjs/testing';
import { HostsController } from './hosts.controller';
import { HostsService } from './hosts.service';
import { JwtService } from '@nestjs/jwt';

describe('HostsController', () => {
  let controller: HostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostsController],
      providers: [
        {
          provide: HostsService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HostsController>(HostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { JwtSignOptions } from '@nestjs/jwt';

export const JWTAccessOptions: JwtSignOptions = {
  secret: 'i&im423S#gl%pr0134*3$prG5hd',
  expiresIn: '1d',
};

export const JWTRefreshOptions: JwtSignOptions = {
  secret: 'p3r0rEhg$330]q34{GH0tTI-MS/8s3',
  expiresIn: '30d',
};

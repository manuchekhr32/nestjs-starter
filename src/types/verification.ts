export enum EVerificationTypes {
  REGISTER = 'register',
  RESET_PASSWORD = 'reset_password',
  EDIT_EMAIL = 'edit_email',
}

export interface ICheckOtp {
  type: EVerificationTypes;
  email: string;
  otp: string;
}

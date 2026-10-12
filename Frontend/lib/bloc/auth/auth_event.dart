import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class CheckAuthStatusEvent extends AuthEvent {}

class LoginRequestedEvent extends AuthEvent {
  final String email;
  final String password;

  const LoginRequestedEvent({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class RegisterRequestedEvent extends AuthEvent {
  final String username;
  final String email;
  final String password;
  final String? phone;
  final String? address;

  const RegisterRequestedEvent({
    required this.username,
    required this.email,
    required this.password,
    this.phone,
    this.address,
  });

  @override
  List<Object?> get props => [username, email, password, phone, address];
}

class VerifyOtpRequestedEvent extends AuthEvent {
  final String email;
  final String otpCode;

  const VerifyOtpRequestedEvent({required this.email, required this.otpCode});

  @override
  List<Object?> get props => [email, otpCode];
}

class LogoutRequestedEvent extends AuthEvent {}

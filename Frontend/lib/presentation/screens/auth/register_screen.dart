import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_event.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';
import 'otp_verification_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  void _onRegister() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthBloc>().add(
        RegisterRequestedEvent(
          fullName: _fullNameController.text,
          email: _emailController.text,
          password: _passwordController.text,
          confirmPassword: _confirmPasswordController.text,
          phone: _phoneController.text,
          address: _addressController.text.trim().isNotEmpty
              ? _addressController.text.trim()
              : null,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Đăng ký tài khoản')),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthOtpRequired) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.info,
              ),
            );
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(
                builder: (_) => OtpVerificationScreen(email: state.email),
              ),
            );
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: AppSpacing.lg,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Form(
                  key: _formKey,
                  autovalidateMode: AutovalidateMode.onUserInteraction,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Tạo tài khoản mới', style: AppTypography.h1),
                      const SizedBox(height: AppSpacing.sm),
                      const Text(
                        'Khám phá kho tiểu thuyết bản quyền và tính năng đọc truyện bảo mật',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 24),
                      // Full name
                      TextFormField(
                        controller: _fullNameController,
                        decoration: const InputDecoration(
                          labelText: 'Họ và tên',
                          prefixIcon: Icon(Icons.person_outline),
                          hintText: 'VD: Nguyen Van A',
                        ),
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return 'Họ tên không được để trống.';
                          }
                          if (val.startsWith(' ') || val.endsWith(' ')) {
                            return 'Họ tên không được có khoảng trắng ở đầu hoặc cuối.';
                          }
                          if (val.length < 9 || val.length > 50) {
                            return 'Họ tên phải từ 9 đến 50 ký tự.';
                          }
                          if (!RegExp(
                            r'^[\p{L} ]+$',
                            unicode: true,
                          ).hasMatch(val)) {
                            return 'Họ tên chỉ được chứa chữ cái và khoảng trắng.';
                          }
                          if (RegExp(r'\s{2,}').hasMatch(val)) {
                            return 'Họ tên không được có 2 khoảng trắng liên tiếp.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Email
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          prefixIcon: Icon(Icons.email_outlined),
                          hintText: 'user@example.com',
                        ),
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Email không được để trống.';
                          }
                          final trimmed = val.trim();
                          if (trimmed.length < 10 || trimmed.length > 50) {
                            return 'Email phải có độ dài từ 10 đến 50 ký tự.';
                          }
                          final emailRegex = RegExp(
                            r'^[\w\.\-]+@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)+$',
                          );
                          if (!emailRegex.hasMatch(trimmed)) {
                            return 'Email không đúng định dạng.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Password
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Mật khẩu',
                          prefixIcon: const Icon(Icons.lock_outline),
                          hintText: 'VD: P@ssw0rd123',
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                        ),
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return 'Mật khẩu không được để trống.';
                          }
                          if (val.length < 8 || val.length > 50) {
                            return 'Mật khẩu phải từ 8 đến 50 ký tự.';
                          }
                          if (val.contains(' ')) {
                            return 'Mật khẩu không được chứa khoảng trắng.';
                          }
                          if (!RegExp(r'[A-Z]').hasMatch(val)) {
                            return 'Mật khẩu phải có ít nhất 1 chữ hoa.';
                          }
                          if (!RegExp(r'[a-z]').hasMatch(val)) {
                            return 'Mật khẩu phải có ít nhất 1 chữ thường.';
                          }
                          if (!RegExp(r'[0-9]').hasMatch(val)) {
                            return 'Mật khẩu phải có ít nhất 1 chữ số.';
                          }
                          if (!RegExp(
                            r'''[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]''',
                          ).hasMatch(val)) {
                            return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Confirm Password
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: _obscureConfirmPassword,
                        decoration: InputDecoration(
                          labelText: 'Xác nhận mật khẩu',
                          prefixIcon: const Icon(Icons.lock_outline),
                          hintText: 'VD: P@ssw0rd123',
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscureConfirmPassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscureConfirmPassword =
                                    !_obscureConfirmPassword;
                              });
                            },
                          ),
                        ),
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return 'Xác nhận mật khẩu không được để trống.';
                          }
                          if (val != _passwordController.text) {
                            return 'Mật khẩu và xác nhận mật khẩu không khớp.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Phone
                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        decoration: const InputDecoration(
                          labelText: 'Số điện thoại',
                          prefixIcon: Icon(Icons.phone_outlined),
                          hintText: 'VD: 0912345678',
                        ),
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Số điện thoại không được để trống.';
                          }
                          final phoneRegex = RegExp(r'^0[35789][0-9]{8}$');
                          if (!phoneRegex.hasMatch(val.trim())) {
                            return 'Số điện thoại không đúng định dạng (VD: 0912345678).';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Address (optional)
                      TextFormField(
                        controller: _addressController,
                        keyboardType: TextInputType.streetAddress,
                        decoration: const InputDecoration(
                          labelText: 'Địa chỉ (tùy chọn)',
                          prefixIcon: Icon(Icons.location_on_outlined),
                          hintText: 'VD: 123 Nguyen Trai, Q1, TP.HCM',
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      // Register button
                      SizedBox(
                        height: 56,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _onRegister,
                          child: isLoading
                              ? const SizedBox(
                                  height: 22,
                                  width: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    color: AppColors.surface,
                                  ),
                                )
                              : const Text(
                                  'Đăng ký',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
